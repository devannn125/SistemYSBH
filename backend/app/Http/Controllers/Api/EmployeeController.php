<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\EmployeeRegisteredMail;
use App\Models\AuditLog;
use App\Models\Contract;
use App\Models\Employee;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmployeeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Employee::with(['user.roles', 'activeContract'])->orderBy('id', 'asc');

        if ($request->filled('division')) {
            $query->where('division', $request->division);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%")
                  ->orWhere('position', 'like', "%{$search}%");
            });
        }

        $employees = $query->paginate($request->input('per_page', 10));

        return response()->json($employees);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'password' => 'nullable|string|min:6',
            'role' => 'required|string|exists:roles,name',
            'division' => 'required|string',
            'position' => 'required|string',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|in:L,P',
            'join_date' => 'required|date',
            'contract_type' => 'required|string',
            'contract_end_date' => 'nullable|date',
        ]);

        $rawPassword = $request->filled('password') ? $request->password : 'YSBH2026!';

        $result = DB::transaction(function () use ($request, $rawPassword) {
            // 1. Buat User Login dengan password yang ditentukan HR atau default
            $user = User::create([
                'name' => $request->name,
                'username' => $request->username,
                'email' => $request->email,
                'phone' => $request->phone,
                'division' => $request->division,
                'position' => $request->position,
                'password' => Hash::make($rawPassword),
                'is_active' => true,
            ]);

            $user->assignRole($request->role);

            // Generate NIK YSBH (misal: YSBH-0008)
            $lastId = Employee::withTrashed()->max('id') ?? 0;
            $nik = 'YSBH-' . str_pad((string) ($lastId + 1), 4, '0', STR_PAD_LEFT);

            // 2. Buat Profil Karyawan
            $employee = Employee::create([
                'user_id' => $user->id,
                'nik' => $nik,
                'full_name' => $request->name,
                'birth_date' => $request->birth_date,
                'gender' => $request->gender,
                'phone' => $request->phone,
                'address' => $request->address,
                'division' => $request->division,
                'position' => $request->position,
                'join_date' => $request->join_date,
                'status' => 'kontrak',
            ]);

            // 3. Buat Kontrak Awal
            $contractNumber = 'KTR/YSBH/' . $nik . '/' . date('Y');
            Contract::create([
                'employee_id' => $employee->id,
                'contract_number' => $contractNumber,
                'contract_type' => $request->contract_type,
                'start_date' => $request->join_date,
                'end_date' => $request->contract_end_date,
                'status' => 'aktif',
                'notes' => 'Kontrak awal saat penerimaan',
            ]);

            AuditLog::record('create_employee', "Karyawan baru {$employee->full_name} ({$nik}) ditambahkan dengan akun {$user->username}", $employee);

            return [
                'user' => $user,
                'employee' => $employee,
            ];
        });

        // 4. Kirimkan email notifikasi akun ke pegawai baru
        try {
            Mail::to($result['user']->email)->send(
                new EmployeeRegisteredMail($result['user'], $result['employee'], $rawPassword)
            );
        } catch (\Throwable $e) {
            Log::error("Gagal mengirim email pendaftaran ke {$result['user']->email}: " . $e->getMessage());
        }

        return response()->json([
            'message' => 'Data pegawai berhasil didaftarkan dan email notifikasi telah dikirim ke ' . $result['user']->email,
            'data' => $result['employee']->load(['user.roles', 'activeContract']),
            'initial_password' => $rawPassword,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $employee = Employee::with(['user.roles', 'contracts', 'payrolls'])->findOrFail($id);
        return response()->json($employee);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $employee = Employee::findOrFail($id);

        $request->validate([
            'full_name' => 'required|string|max:255',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'division' => 'required|string',
            'position' => 'required|string',
            'status' => 'required|string',
        ]);

        $employee->update($request->only([
            'full_name', 'phone', 'address', 'division', 'position', 'status'
        ]));

        if ($employee->user) {
            $employee->user->update([
                'name' => $request->full_name,
                'phone' => $request->phone,
                'division' => $request->division,
                'position' => $request->position,
            ]);
        }

        AuditLog::record('update_employee', "Data karyawan {$employee->full_name} diperbarui", $employee);

        return response()->json([
            'message' => 'Data karyawan berhasil diperbarui',
            'data' => $employee->load(['user.roles', 'activeContract']),
        ]);
    }

    public function expiringContracts(): JsonResponse
    {
        // Kontrak yang berakhir dalam 60 hari ke depan (FR-HR-03)
        $threshold = Carbon::now()->addDays(60);

        $contracts = Contract::with(['employee.user'])
            ->where('status', 'aktif')
            ->whereNotNull('end_date')
            ->where('end_date', '<=', $threshold)
            ->where('end_date', '>=', Carbon::now())
            ->orderBy('end_date', 'asc')
            ->get();

        return response()->json($contracts);
    }
}

