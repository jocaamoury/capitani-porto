import { Payment } from './payment.entity';
import { PaymentMethod, PaymentStatus } from './payment.enums';

export interface PaymentFilter {
  cpf?: string;
  paymentMethod?: PaymentMethod;
}

export interface IPaymentRepository {
  create(payment: Payment): Promise<Payment>;
  updateStatus(id: string, status: PaymentStatus): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findAll(filter: PaymentFilter): Promise<Payment[]>;
}
