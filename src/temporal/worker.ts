import { Worker } from '@temporalio/worker';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const worker = await Worker.create({
    taskQueue: 'PAYMENT_QUEUE',

    // Pasta com index.ts exportando workflows
    workflowsPath: require.resolve('./workflows'),

    // Activities carregadas como objeto
    activities: require('./activities/payment.activities'),
  });

  await worker.run();
}

run().catch(console.error);
