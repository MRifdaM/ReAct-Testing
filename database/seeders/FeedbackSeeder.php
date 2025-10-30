<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FeedbackSeeder extends Seeder
{
    public function run(): void
    {
        // Find reports assigned to teknisi_id = 1
        $laporans = DB::table('t_laporan_kerusakan')
            ->where('teknisi_id', 1)
            ->orderBy('created_at', 'desc')
            ->get();

        if ($laporans->isEmpty()) {
            $this->command->info('No laporan found for teknisi_id = 1. Skipping FeedbackSeeder.');
            return;
        }

        $inserts = [];
        $count = 0;
        foreach ($laporans as $laporan) {
            if ($count >= 5) break; // add up to 5 dummy feedback items

            $inserts[] = [
                'user_id'    => $laporan->user_id ?? 3,
                'laporan_id' => $laporan->laporan_id,
                'rating'     => 4,
                'komentar'   => "Umpan balik dummy untuk teknisi1 pada laporan {$laporan->laporan_judul}",
                'created_at' => Carbon::now()->subDays($count + 1),
                'updated_at' => Carbon::now()->subDays($count + 1),
            ];

            $count++;
        }

        if (!empty($inserts)) {
            DB::table('t_feedback')->insert($inserts);
            $this->command->info('Inserted '.count($inserts).' dummy feedback records for teknisi1.');
        }
    }
}
