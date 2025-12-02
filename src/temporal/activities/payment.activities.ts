import axios from 'axios';
import { DataSource } from 'typeorm';
import { PaymentOrmEntity } from '../../infrastructure/persistence/payment/payment.orm-entity';
import { PaymentStatus } from '../../domain/payment/payment.enums';

const api = axios.create({
  baseURL: 'https://api.mercadopago.com',
  headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
});

export async function createPreference(payment: any) {
  const body = {
    items: [
      {
        title: payment.description,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: Number(payment.amount)
      }
    ],
    external_reference: payment.id,
    notification_url: process.env.MP_WEBHOOK_URL
  };

  const { data } = await api.post('/checkout/preferences', body);

  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [PaymentOrmEntity],
  });

  await ds.initialize();

  await ds
    .getRepository(PaymentOrmEntity)
    .update(payment.id, {
      mercadoPagoPreferenceId: data.id,
      paymentUrl: data.init_point
    });

  await ds.destroy();

  return data;
}

export async function getPaymentStatus(internalId: string) {
  const { data } = await api.get(`/v1/payments/search`, {
    params: { external_reference: internalId }
  });

  if (!data.results || data.results.length === 0) {
    return null;
  }

  return data.results[0].status;
}

export async function updatePaymentStatus(internalId: string, status: string) {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [PaymentOrmEntity],
  });

  await ds.initialize();

  await ds
    .getRepository(PaymentOrmEntity)
    .update(internalId, { status: status as PaymentStatus });

  await ds.destroy();
}
