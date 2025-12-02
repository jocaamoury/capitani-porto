import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentOrmEntity } from '../../infrastructure/persistence/payment/payment.orm-entity';
import { PaymentTypeOrmRepository } from '../../infrastructure/persistence/payment/payment.typeorm-repository';
import { PaymentService } from './services/payment.service';
import { MercadoPagoService } from './services/mercadopago.service';
import { PaymentController } from './controllers/payment.controller';
import { MercadoPagoWebhookController } from './controllers/mercadopago-webhook.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentOrmEntity])],
  controllers: [PaymentController, MercadoPagoWebhookController],
  providers: [PaymentTypeOrmRepository, PaymentService, MercadoPagoService]
})
export class PaymentModule {}
