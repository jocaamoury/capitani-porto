import {
  proxyActivities,
  sleep,
  defineSignal,
  defineQuery,
  setHandler,
  log
} from '@temporalio/workflow';

const { createPreference, getPaymentStatus, updatePaymentStatus } =
  proxyActivities({ startToCloseTimeout: "1 minute" });

export const paymentStatusSignal = defineSignal<[string]>("paymentStatusSignal");
export const getPreferenceUrlQuery = defineQuery<string | null>("getPreferenceUrl");

export async function PaymentWorkflow(input: {
  paymentId: string;
  description: string;
  amount: number;
}) {

  let finalStatus: string | null = null;
  let preferenceUrl: string | null = null;

  // handler signal
  setHandler(paymentStatusSignal, (status) => {
    log.info(`📩 Signal recebido: ${status}`);
    finalStatus = status;
  });

  // handler query
  setHandler(getPreferenceUrlQuery, () => preferenceUrl);

  await updatePaymentStatus(input.paymentId, "PENDING");

  const pref = await createPreference({
    id: input.paymentId,
    description: input.description,
    amount: input.amount,
  });

  preferenceUrl = pref.init_point; // 👈 ESSENCIAL

  log.info("🧾 Preference criada", {
    paymentId: input.paymentId,
    preferenceId: pref.id,
    url: preferenceUrl,
  });

  // loop
  while (true) {
    if (finalStatus) {
      await updatePaymentStatus(input.paymentId, finalStatus);
      return;
    }

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
