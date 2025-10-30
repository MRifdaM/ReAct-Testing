<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TransaksiTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Matikan foreign key checks untuk mengizinkan truncate
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // 2. Truncate (kosongkan) semua tabel transaksi dengan cepat
        DB::table('t_laporan_kerusakan')->truncate();
        DB::table('t_riwayat_perbaikan')->truncate();
        DB::table('t_feedback')->truncate();
        DB::table('t_laporan_barang')->truncate();
        DB::table('t_statistik_laporan')->truncate();

                                                                                             // 3. Ambil ID yang diperlukan (dari data master yg sudah di-import)
                                                                                             // Ambil dinamis untuk menghindari asumsi tentang nilai autoincrement
        $userIdMhs = DB::table('m_users')->where('username', 'mahasiswa')->value('user_id'); // User 'mahasiswa'
                                                                                             // Cari teknisi berdasarkan keahlian yang diset di TeknisiSeeder
        $teknisiIdPerabot  = DB::table('m_teknisi')->where('keahlian', 'Perabot')->value('teknisi_id');
        $teknisiIdKomputer = DB::table('m_teknisi')->where('keahlian', 'Komputer')->value('teknisi_id');
        // Ambil user_id yang terhubung ke teknisi (dipakai dalam tabel riwayat yang menyimpan user teknisi)
        $teknisiUserPerabot  = DB::table('m_teknisi')->where('keahlian', 'Perabot')->value('user_id');
        $teknisiUserKomputer = DB::table('m_teknisi')->where('keahlian', 'Komputer')->value('user_id');

        // 4. Masukkan data laporan spesifik untuk testing Cypress

        // Laporan untuk tes filter PENDING (dicari oleh filter_laporan.cy.js)
        DB::table('t_laporan_kerusakan')->insert([
            'user_id'           => $userIdMhs, 'role'              => 'mhs', 'gedung_id'           => 1, 'lantai_id' => 5,
            'ruang_id'          => 2, 'sarana_id'                  => 30, // Ruang RT01, Sarana SAR-0030
            'laporan_judul'     => 'Laporan Pending dari Seeder',         // Judul yg dicari tes
            'tingkat_kerusakan' => 'rendah', 'tingkat_urgensi'     => 'rendah', 'dampak_kerusakan' => 'kecil',
            'status_laporan'    => 'pending',
            'created_at'        => now()->subDays(1), 'updated_at' => now()->subDays(1),
        ]);

        // Laporan untuk tes filter PROSES (dicari oleh filter_laporan.cy.js)
        DB::table('t_laporan_kerusakan')->insert([
            'user_id'           => $userIdMhs, 'role'              => 'mhs', 'gedung_id'           => 1, 'lantai_id' => 5,
            'ruang_id'          => 3, 'sarana_id'                  => 67, // Ruang RT02, Sarana SAR-0067
            'teknisi_id'        => $teknisiIdPerabot,
            'laporan_judul'     => 'Laporan Proses dari Seeder', // Judul yg dicari tes
            'tingkat_kerusakan' => 'sedang', 'tingkat_urgensi'     => 'sedang', 'dampak_kerusakan' => 'sedang',
            'status_laporan'    => 'diproses', 'tanggal_diproses'  => now()->subDays(2),
            'created_at'        => now()->subDays(2), 'updated_at' => now()->subDays(2),
        ]);

        // Laporan untuk tes filter SELESAI (dicari oleh filter_laporan.cy.js)
        $laporanSelesaiId = DB::table('t_laporan_kerusakan')->insertGetId([
            'user_id'           => $userIdMhs, 'role'              => 'mhs', 'gedung_id'                   => 1, 'lantai_id' => 5,
            'ruang_id'          => 1, 'sarana_id'                  => 7, // Ruang LPY1, Sarana SAR-0007 (Komputer)
            'teknisi_id'        => $teknisiIdKomputer,
            'laporan_judul'     => 'Laporan Selesai dari Seeder', // Judul yg dicari tes
            'tingkat_kerusakan' => 'tinggi', 'tingkat_urgensi'     => 'tinggi', 'dampak_kerusakan'         => 'besar',
            'status_laporan'    => 'selesai', 'tanggal_diproses'   => now()->subDays(3), 'tanggal_selesai' => now()->subDays(2),
            'created_at'        => now()->subDays(3), 'updated_at' => now()->subDays(2),
        ]);

                                   // 5. Masukkan data riwayat perbaikan (untuk laporan selesai)
        $teknisiUserIDSelesai = 6; // User ID untuk Teknisi2 (Komputer)
        DB::table('t_riwayat_perbaikan')->insert([
            'laporan_id'  => $laporanSelesaiId, 'teknisi_id'    => $teknisiUserIDSelesai, 'tindakan' => 'Instal ulang OS',
            'bahan'       => 'Flashdisk Bootable', 'biaya'      => 0.00, 'status'                    => 'selesai',
            'waktu_mulai' => now()->subDays(3), 'waktu_selesai' => now()->subDays(2),
            'created_at'  => now(), 'updated_at'                => now(),
        ]);

        // 6. Aktifkan kembali foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
}
