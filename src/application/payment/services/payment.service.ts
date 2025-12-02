import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentTypeOrmRepository } from '../../../infrastructure/persistence/payment/payment.typeorm-repository';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { FilterPaymentDto } from '../dto/filter-payment.dto';
import { PaymentStatus, PaymentMethod } from '../../../../domain/payment/payment.enums';
import { MercadoPagoService } from './mercadopago.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly repo: PaymentTypeOrmRepository,
    private readonly mp: MercadoPagoService
  ){}

  async createPayment(dto: CreatePaymentDto){
    const payment = await this.repo.create({
      ...dto,
      status: PaymentStatus.PENDING
    } as any);

    if(dto.paymentMethod === PaymentMethod.CREDIT_CARD){
      const pref = await this.mp.createPreference(payment);
      payment.mercadoPagoPreferenceId = pref.id;
      await this.repo.create(payment as any);
      return { ...payment, initPoint: pref.init_point };
    }

    return payment;
  }

  async updatePayment(id: string, dto: UpdatePaymentDto){
    return await this.repo.updateStatus(id, dto.status);
  }

  async getPayment(id: string){
    const p = await this.repo.findById(id);
    if(!p) throw new NotFoundException("Payment not found");
    return p;
  }

  async listPayments(filter: FilterPaymentDto){
    return await this.repo.findAll(filter);
  }

  async handleMercadoPagoWebhook(query: any, body: any){
    const paymentId = query['data.id'] || body.data?.id;
    if(!paymentId) return;

    const mpPayment = await this.mp.getPayment(paymentId);
    const internalId = mpPayment.external_reference;
    if(!internalId) return;

    const status = mpPayment.status === 'approved'
        ? PaymentStatus.PAID
        : PaymentStatus.FAIL;

    await this.repo.updateStatus(internalId, status);
  }
}
