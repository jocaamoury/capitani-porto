import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, Length, Matches } from 'class-validator';
import { PaymentMethod } from '../../../domain/payment/payment.enums';

export class CreatePaymentDto {
  @IsString()
  @Length(11,11)
  @Matches(/^\d+$/)
  cpf: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
