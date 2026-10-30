<?php

namespace App\Mail;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmployeeRegisteredMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public Employee $employee;
    public string $rawPassword;
    public string $loginUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, Employee $employee, string $rawPassword)
    {
        $this->user = $user;
        $this->employee = $employee;
        $this->rawPassword = $rawPassword;
        $this->loginUrl = config('app.frontend_url', env('APP_FRONTEND_URL', 'http://localhost:5173/login'));
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Selamat Datang di SIMSBH - Akun Pegawai Baru Anda Telah Terdaftar',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.employee_registered',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}

