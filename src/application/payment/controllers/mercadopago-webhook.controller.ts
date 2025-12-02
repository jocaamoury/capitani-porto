import { Body, Controller, Post, Query } from '@nestjs/common';
import { PaymentService } from '../services/payment.service';

@Controller('api/payment/mercadopago')
export class MercadoPagoWebhookController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  async webhook(@Body() body: any, @Query() query: any) {
    await this.paymentService.handleMercadoPagoWebhook(query, body);
    return { received: true };
  }
}
