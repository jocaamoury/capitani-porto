import { proxyActivities, sleep } from '@temporalio/workflow';

const { createPreference, getPaymentStatus, updatePaymentStatus } = proxyActivities({
  startToCloseTimeout: "1 minute"
});

export async function PaymentWorkflow(input: {
  paymentId: string;
  description: string;
  amount: number;
}) {

  await updatePaymentStatus(input.paymentId, "PENDING");

    const pref = await createPreference({
      id: input.paymentId,
      description: input.description,
      amount: input.amount
    });

  while (true) {
    await sleep(10_000);

    const status = await getPaymentStatus(input.paymentId);

    if (status === "approved") {
      await updatePaymentStatus(input.paymentId, "PAID");
      return;
    }

    if (status === "rejected" || status === "cancelled") {
      await updatePaymentStatus(input.paymentId, "FAIL");
      return;
    }
  }
}