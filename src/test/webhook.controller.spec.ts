import { Test } from '@nestjs/testing';
import { MercadoPagoWebhookController } from '../application/payment/controllers/mercadopago-webhook.controller';
import { PaymentService } from '../application/payment/services/payment.service';

describe('WebhookController', () => {
  let controller: MercadoPagoWebhookController;
  let service: jest.Mocked<PaymentService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [MercadoPagoWebhookController],
      providers: [
        {
          provide: PaymentService,
          useValue: {
            handleMercadoPagoWebhook: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(MercadoPagoWebhookController);
    service = module.get(PaymentService) as any;
  });

  it('POST webhook deve chamar service', async () => {
    const r = await controller.webhook({ test: true }, {});

    expect(r).toEqual({ received: true });
    expect(service.handleMercadoPagoWebhook).toHaveBeenCalled();
  });
});
