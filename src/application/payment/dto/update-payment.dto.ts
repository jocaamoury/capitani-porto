import { IsEnum } from 'class-validator';
import { PaymentStatus } from '../../../../domain/payment/payment.enums';

export class UpdatePaymentDto {
  @IsEnum(PaymentStatus)
  status: PaymentStatus;
}
