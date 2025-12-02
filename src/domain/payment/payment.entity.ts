import { PaymentMethod, PaymentStatus } from './payment.enums';
export class Payment {
  constructor(
    public id: string,
    public cpf: string,
    public description: string,
    public amount: number,
    public paymentMethod: PaymentMethod,
    public status: PaymentStatus,
    public mercadoPagoPreferenceId?: string,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}