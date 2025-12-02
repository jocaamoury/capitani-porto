import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MercadoPagoService {
  private readonly api = axios.create({
    baseURL: 'https://api.mercadopago.com',
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
    }
  });

  async createPreference(payment: any){
    const body = {
      items: [
        { title: payment.description, quantity: 1, currency_id: 'BRL', unit_price: Number(payment.amount) }
      ],
      external_reference: payment.id,
      notification_url: 'http://localhost:3000/api/payment/mercadopago/webhook'
    };

    const { data } = await this.api.post('/checkout/preferences', body);
    return data;
  }

  async getPayment(id: string){
    const { data } = await this.api.get(`/v1/payments/${id}`);
    return data;
  }
}
