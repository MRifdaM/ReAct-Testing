<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            LevelSeeder::class,
            UsersSeeder::class, // Ensure your seeder is listed here
            KategoriSeeder::class,
            GedungSeeder::class,
            TeknisiSeeder::class,
            LantaiSeeder::class,
            RuangSeeder::class,
            BarangSeeder::class,
            SaranaSeeder::class,
            SarPrasSeeder::class,
            TransaksiTestSeeder::class,
            // Call LaporanSeeder last so it is not wiped by other test seeders that truncate tables
            LaporanSeeder::class,
            // Insert feedback after laporan so feedback refers to existing laporan rows
            FeedbackSeeder::class,
        ]);
    }
}
