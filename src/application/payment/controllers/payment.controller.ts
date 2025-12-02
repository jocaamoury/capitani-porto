import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { FilterPaymentDto } from '../dto/filter-payment.dto';

@Controller('api/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentService.createPayment(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.paymentService.updatePayment(id, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.getPayment(id);
  }

  @Get()
  findAll(@Query() filter: FilterPaymentDto) {
    return this.paymentService.listPayments(filter);
  }
}
