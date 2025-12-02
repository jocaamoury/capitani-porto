import { Worker } from '@temporalio/worker';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const worker = await Worker.create({
    taskQueue: 'PAYMENT_QUEUE',

    workflowsPath: require.resolve('./workflows'),
    activities: require('./activities/payment.activities'),
  });

  await worker.run();
}

run().catch(console.error);
