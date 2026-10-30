<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Akun Pegawai Baru SIMSBH</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #F7FAF8;
      color: #14201A;
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    .wrapper {
      max-width: 600px;
      margin: 30px auto;
      background-color: #FFFFFF;
      border: 1px solid #E3EAE5;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(20, 32, 26, 0.05);
    }
    .header {
      background-color: #15803D;
      padding: 28px 32px;
      color: #FFFFFF;
      text-align: left;
    }
    .header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .header p {
      margin: 6px 0 0 0;
      font-size: 12px;
      opacity: 0.9;
    }
    .badge {
      display: inline-block;
      background-color: rgba(255, 255, 255, 0.2);
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .content {
      padding: 32px;
      line-height: 1.6;
    }
    .greeting {
      font-size: 16px;
      font-weight: 600;
      color: #14201A;
      margin-bottom: 12px;
    }
    .text {
      font-size: 14px;
      color: #475569;
      margin-bottom: 20px;
    }
    .credentials-box {
      background-color: #F0FDF4;
      border: 1px solid #DCFCE7;
      border-radius: 10px;
      padding: 20px;
      margin: 24px 0;
    }
    .credentials-title {
      font-size: 13px;
      font-weight: 700;
      color: #15803D;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 14px;
      border-bottom: 1px dashed #BBF7D0;
      padding-bottom: 8px;
    }
    .cred-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
    }
    .cred-label {
      color: #586862;
      width: 40%;
    }
    .cred-value {
      font-weight: 600;
      color: #14201A;
      width: 60%;
      word-break: break-all;
    }
    .cred-value.highlight {
      font-family: 'Courier New', Courier, monospace;
      color: #15803D;
      background-color: #DCFCE7;
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
    }
    .notice-box {
      background-color: #FEF3C7;
      border: 1px solid #FDE68A;
      border-radius: 8px;
      padding: 14px 16px;
      margin: 20px 0;
      font-size: 12px;
      color: #92400E;
      line-height: 1.5;
    }
    .notice-box strong {
      color: #78350F;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0 16px 0;
    }
    .btn {
      display: inline-block;
      background-color: #15803D;
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.01em;
      box-shadow: 0 2px 4px rgba(21, 128, 61, 0.2);
    }
    .footer {
      background-color: #F8FAFC;
      border-top: 1px solid #E3EAE5;
      padding: 20px 32px;
      text-align: center;
      font-size: 11px;
      color: #94A3B8;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Header -->
    <div class="header">
      <div class="badge">SIMSBH v1.0</div>
      <h1>Yayasan Sinar Bhakti Husada</h1>
      <p>Sistem Informasi Manajemen Terpadu Operasional Papua</p>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">Yth. Bapak/Ibu {{ $employee->full_name }},</div>
      <div class="text">
        Selamat bergabung di <strong>Yayasan Sinar Bhakti Husada (YSBH)</strong>! Akun Anda telah resmi didaftarkan oleh HR Manager ke dalam portal sistem operasional terintegrasi SIMSBH.
      </div>

      <!-- Kredensial Akun -->
      <div class="credentials-box">
        <div class="credentials-title">Informasi Akun Masuk Anda</div>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #586862; width: 42%;">Nama Lengkap</td>
            <td style="padding: 6px 0; font-weight: 600; color: #14201A;">{{ $employee->full_name }}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #586862;">Nomor Induk Karyawan (NIK)</td>
            <td style="padding: 6px 0; font-weight: 600; font-family: monospace; color: #15803D;">{{ $employee->nik }}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #586862;">Divisi & Jabatan</td>
            <td style="padding: 6px 0; font-weight: 600; color: #14201A;">{{ $employee->division }} — {{ $employee->position }}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #586862;">Nama Pengguna (Username)</td>
            <td style="padding: 6px 0; font-weight: 700; color: #15803D; font-family: monospace;">{{ $user->username }}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #586862;">Kata Sandi Awal (Password)</td>
            <td style="padding: 6px 0;">
              <span style="background-color: #DCFCE7; color: #15803D; font-family: monospace; font-weight: 700; padding: 2px 8px; border-radius: 4px; font-size: 13px;">
                {{ $rawPassword }}
              </span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Himbauan Keamanan / Ubah Password -->
      <div class="notice-box">
        <strong>PENTING — Himbauan Keamanan Akun:</strong><br>
        Demi menjaga keamanan data operasional yayasan dan kerahasiaan akun pribadi Anda, Anda <strong>diwajibkan untuk segera mengganti kata sandi awal</strong> ini setelah berhasil masuk pertama kali melalui tombol <em>"Ubah Kata Sandi"</em> pada profil pengguna Anda.
      </div>

      <!-- Call to Action -->
      <div class="btn-container">
        <a href="{{ $loginUrl }}" class="btn" target="_blank">Masuk ke Portal SIMSBH &rarr;</a>
      </div>

      <div class="text" style="font-size: 12px; color: #64748B; margin-top: 24px;">
        Jika Anda mengalami kesulitan saat masuk ke sistem, silakan menghubungi tim HR Manager atau Administrator SIMSBH.
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 0 0 4px 0;"><strong>Yayasan Sinar Bhakti Husada (YSBH)</strong></p>
      <p style="margin: 0 0 4px 0;">Posko Operasional: Merauke & Jayapura, Papua, Indonesia</p>
      <p style="margin: 6px 0 0 0; font-size: 10px; color: #94A3B8;">
        Email ini dibuat secara otomatis oleh sistem SIMSBH. Mohon untuk tidak membalas email ini secara langsung.
      </p>
    </div>
  </div>
</body>
</html>

