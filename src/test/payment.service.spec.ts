import { Test, TestingModule } from '@nestjs/testing';
import { MercadoPagoService } from '../application/payment/services/mercadopago.service';
import { PaymentService } from '../application/payment/services/payment.service';
import { PaymentMethod, PaymentStatus } from '../domain/payment/payment.enums';
import { PaymentTypeOrmRepository } from '../infrastructure/persistence/payment/payment.typeorm-repository';


/**
 * -------------------------------
 * MOCKS DO TEMPORAL (necessários)
 * -------------------------------
 */

const mockWorkflowHandle = {
  query: jest.fn(),
  signal: jest.fn(),
};

const mockTemporalClient = {
  workflow: {
    start: jest.fn(),
    getHandle: jest.fn().mockReturnValue(mockWorkflowHandle),
  },
};

jest.mock('@temporalio/client', () => ({
  Connection: {
    connect: jest.fn().mockResolvedValue({}),
  },
  Client: jest.fn().mockImplementation(() => mockTemporalClient),
}));

/**
 * -------------------------------
 * INÍCIO DOS TESTES
 * -------------------------------
 */

describe('PaymentService', () => {
  let service: PaymentService;
  let repo: jest.Mocked<PaymentTypeOrmRepository>;
  let mp: jest.Mocked<MercadoPagoService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: PaymentTypeOrmRepository,
          useValue: {
            create: jest.fn(),
            updateStatus: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: MercadoPagoService,
          useValue: {
            getPayment: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    repo = module.get(PaymentTypeOrmRepository) as any;
    mp = module.get(MercadoPagoService) as any;

    mockTemporalClient.workflow.start.mockClear();
    mockWorkflowHandle.query.mockClear();
    mockWorkflowHandle.signal.mockClear();
  });

  // --------------------------------------------
  // CREATE PAYMENT — credit card + workflow
  // --------------------------------------------
 it('deve criar pagamento com cartão e retornar URL', async () => {
    const dto = {
      cpf: "04123160212",
      description: "Test",
      amount: 10,
      paymentMethod: PaymentMethod.CREDIT_CARD,
    };

    const savedPayment = {
      id: "123",
      ...dto,
      status: PaymentStatus.PENDING,
    };

    repo.create.mockResolvedValue(savedPayment as any);

    mockWorkflowHandle.query
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce("http://url");

    mockTemporalClient.workflow.start.mockResolvedValue(mockWorkflowHandle as any);

    const result = await service.createPayment(dto) as any; // 👈 cast importante

    expect(result.paymentUrl).toBe("http://url");
    expect(mockTemporalClient.workflow.start).toHaveBeenCalled();
  });

  // --------------------------------------------
  // CREATE PAYMENT — PIX (sem workflow)
  // --------------------------------------------
  it('não deve iniciar workflow quando pagamento for PIX', async () => {
    const dto = {
      cpf: "04123160212",
      description: "Test",
      amount: 10,
      paymentMethod: PaymentMethod.PIX,
    };

    repo.create.mockResolvedValue({
      id: "123",
      ...dto,
      status: PaymentStatus.PENDING,
    });

    const result = await service.createPayment(dto);

    expect(result.id).toBe("123");
    expect(mockTemporalClient.workflow.start).not.toHaveBeenCalled();
  });

  // --------------------------------------------
  // getPayment — OK
  // --------------------------------------------
  it('deve retornar pagamento por ID', async () => {
    repo.findById.mockResolvedValue({ id: "abc" } as any);

    const result = await service.getPayment("abc");
    expect(result.id).toBe("abc");
  });

  // --------------------------------------------
  // getPayment — não encontrado
  // --------------------------------------------
  it('deve lançar erro quando pagamento não existe', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(service.getPayment("x")).rejects.toThrow("Payment not found");
  });

  // --------------------------------------------
  // handleWebhook — approved
  // --------------------------------------------
  it('deve atualizar pagamento e enviar SIGNAL (approved)', async () => {
    mp.getPayment.mockResolvedValue({
      external_reference: "123",
      status: "approved",
    });

    repo.updateStatus.mockResolvedValue({} as any);

    await service.handleMercadoPagoWebhook({}, { data: { id: "999" } });

    expect(repo.updateStatus).toHaveBeenCalledWith("123", PaymentStatus.PAID);
    expect(mockWorkflowHandle.signal).toHaveBeenCalledWith(
      "paymentStatusSignal",
      PaymentStatus.PAID
    );
  });

  // --------------------------------------------
  // handleWebhook — rejected
  // --------------------------------------------
  it('deve atualizar pagamento com FAIL', async () => {
    mp.getPayment.mockResolvedValue({
      external_reference: "123",
      status: "rejected",
    });

    await service.handleMercadoPagoWebhook({}, { data: { id: "999" } });

    expect(repo.updateStatus).toHaveBeenCalledWith("123", PaymentStatus.FAIL);
  });
});
