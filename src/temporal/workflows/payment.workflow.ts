import { proxyActivities, sleep, defineQuery, setHandler } from '@temporalio/workflow';

const { createPreference, getPaymentStatus, updatePaymentStatus } = proxyActivities({
  startToCloseTimeout: "1 minute"
});

// Query para retornar a URL da preference
export const getPreferenceUrlQuery = defineQuery<string>('getPreferenceUrl');

export async function PaymentWorkflow(input: {
  paymentId: string;
  description: string;
  amount: number;
}) {

  let preferenceUrl = '';

  // Handler da Query — API poderá consultar essa variável em tempo real
  setHandler(getPreferenceUrlQuery, () => preferenceUrl);

  await updatePaymentStatus(input.paymentId, "PENDING");

  // Chama activity (cria preference + salva no banco)
  const pref = await createPreference({
    id: input.paymentId,
    description: input.description,
    amount: input.amount
  });

  // Guarda no estado do workflow
  preferenceUrl = pref.init_point;

  // Continua monitorando pagamento
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
