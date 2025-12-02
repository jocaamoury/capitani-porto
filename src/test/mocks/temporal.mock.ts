export const mockWorkflowHandle = {
  query: jest.fn(),
  signal: jest.fn(),
};

export const mockTemporalClient = {
  workflow: {
    start: jest.fn(),
    getHandle: jest.fn().mockReturnValue(mockWorkflowHandle),
  }
};

jest.mock('@temporalio/client', () => {
  return {
    Connection: {
      connect: jest.fn().mockResolvedValue({}),
    },
    Client: jest.fn().mockImplementation(() => mockTemporalClient),
  };
});
