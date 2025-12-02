import {
  proxyActivities,
  sleep,
  defineSignal,
  defineQuery,
  setHandler,
  log,
  condition
} from '@temporalio/workflow';

const { createPreference, getPaymentStatus, updatePaymentStatus } =
  proxyActivities({
    startToCloseTimeout: '1 minute',
  });

export const paymentStatusSignal = defineSignal<[string]>("paymentStatusSignal");

export const getPreferenceUrlQuery = defineQuery<string | null>("getPreferenceUrl");

export async function PaymentWorkflow(input: {
  paymentId: string;
  description: string;
  amount: number;
}) {

  let finalStatus: string | null = null;
  let preferenceUrl: string | null = null;

  setHandler(paymentStatusSignal, (status) => {
    log.info(`Signal received from webhook: ${status}`);
    finalStatus = status;
  });

  setHandler(getPreferenceUrlQuery, () => preferenceUrl);

  await updatePaymentStatus(input.paymentId, "PENDING");

  const pref = await createPreference({
    id: input.paymentId,
    description: input.description,
    amount: input.amount,
  });

  preferenceUrl = pref.init_point;

  log.info("Preference created", {
    paymentId: input.paymentId,
    preferenceId: pref.id,
    url: preferenceUrl,
  });

  while (true) {

    if (finalStatus) {
      log.info(`Workflow completed via SIGNAL: ${finalStatus}`);
      await updatePaymentStatus(input.paymentId, finalStatus);
      return;
    }

    await sleep(60_000);

    const status = await getPaymentStatus(input.paymentId);

    if (status === "approved") {
      log.info("Finalized via POLLING = approved");
      await updatePaymentStatus(input.paymentId, "PAID");
      return;
    }

    if (status === "rejected" || status === "cancelled") {
      log.info("Finalized via POLL = rejected/cancelled");
      await updatePaymentStatus(input.paymentId, "FAIL");
      return;
    }
  }
}
