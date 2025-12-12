<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class ProcessQueueCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'curonews:process-queue 
                            {--queue=default : The queue to process}
                            {--limit=10 : Maximum number of jobs to process}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process queued jobs (for cPanel cron)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $queue = $this->option('queue');
        $limit = (int) $this->option('limit');

        $this->info("Processing up to {$limit} jobs from '{$queue}' queue...");

        // Run queue:work with --once flag for each job
        $processed = 0;

        for ($i = 0; $i < $limit; $i++) {
            $result = Artisan::call('queue:work', [
                '--once' => true,
                '--queue' => $queue,
                '--tries' => 3,
                '--timeout' => 120,
            ]);

            // If no job was processed, exit early
            if ($result !== 0) {
                break;
            }

            $processed++;
            $this->line("Processed job {$processed}");
        }

        if ($processed === 0) {
            $this->info('No jobs to process.');
        } else {
            $this->info("Processed {$processed} job(s).");
        }

        return Command::SUCCESS;
    }
}
