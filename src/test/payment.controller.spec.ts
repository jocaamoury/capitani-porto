import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from '../application/payment/controllers/payment.controller';
import { PaymentService } from '../application/payment/services/payment.service';
import { PaymentStatus } from '../domain/payment/payment.enums';


describe('PaymentController', () => {
  let controller: PaymentController;
  let service: jest.Mocked<PaymentService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService,
          useValue: {
            createPayment: jest.fn(),
            updatePayment: jest.fn(),
            getPayment: jest.fn(),
            listPayments: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(PaymentController);
    service = module.get(PaymentService) as any;
  });

  it('POST create deve chamar service', async () => {
    service.createPayment.mockResolvedValue({ id: '1' } as any);
    const result = await controller.create({} as any);
    expect(result.id).toBe('1');
    expect(service.createPayment).toHaveBeenCalled();
  });

  it('GET :id deve chamar service', async () => {
    service.getPayment.mockResolvedValue({ id: 'x' } as any);
    const r = await controller.findOne('x');
    expect(r.id).toBe('x');
  });

  it('PUT :id deve atualizar', async () => {
service.updatePayment.mockResolvedValue({ id: 'z', status: PaymentStatus.PAID } as any);
const r = await controller.update('z', { status: PaymentStatus.PAID });

    expect(r.status).toBe('PAID');
  });

  it('GET (list) deve retornar lista', async () => {
    service.listPayments.mockResolvedValue([{ id: '1' }] as any);
    const r = await controller.findAll({});
    expect(r[0].id).toBe('1');
  });
});
