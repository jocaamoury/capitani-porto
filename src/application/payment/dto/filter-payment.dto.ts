import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';
import { PaymentMethod } from '../../../../domain/payment/payment.enums';

export class FilterPaymentDto {
  @IsOptional()
  @IsString()
  @Length(11,11)
  @Matches(/^\d+$/)
  cpf?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}
