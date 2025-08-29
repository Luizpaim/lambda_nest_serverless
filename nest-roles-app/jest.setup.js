// Jest setup file
process.env.NODE_ENV = 'test'
process.env.CI = 'true'

// Configure test environment variables
process.env.DYNAMODB_TABLE_ROLES = 'test-roles'

// DynamoDB test environment variables
process.env.APP_ENVIRONMENT = 'test'

// AWS test environment variables
process.env.AWS_REGION = 'sa-east-1'
process.env.AWS_ACCESS_KEY_ID = 'test-access-key'
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key'

// Increase timeout for all tests
jest.setTimeout(30000)

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    // Uncomment to ignore a specific log level
    // log: jest.fn(),
    // debug: jest.fn(),
    // info: jest.fn(),
    // warn: jest.fn(),
    // error: jest.fn(),
}

// Mock AWS SDK for tests
jest.mock('@aws-sdk/client-dynamodb', () => ({
    DynamoDBClient: jest.fn().mockImplementation(() => ({
        send: jest.fn().mockResolvedValue({
            TableNames: ['test-table-1', 'test-table-2'],
        }),
    })),
    ListTablesCommand: jest.fn(),
    DescribeTableCommand: jest.fn(),
    CreateTableCommand: jest.fn(),
    PutItemCommand: jest.fn(),
    GetItemCommand: jest.fn(),
    QueryCommand: jest.fn(),
    ScanCommand: jest.fn(),
    DeleteItemCommand: jest.fn(),
    UpdateItemCommand: jest.fn(),
}))

jest.mock('@aws-sdk/lib-dynamodb', () => ({
    DynamoDBDocumentClient: {
        from: jest.fn().mockReturnValue({
            send: jest.fn().mockResolvedValue({
                Items: [],
                Count: 0,
                ScannedCount: 0,
            }),
            putItem: jest.fn().mockResolvedValue({}),
            getItem: jest.fn().mockResolvedValue({}),
            query: jest.fn().mockResolvedValue({}),
            scan: jest.fn().mockResolvedValue({}),
            deleteItem: jest.fn().mockResolvedValue({}),
            updateItem: jest.fn().mockResolvedValue({}),
        }),
    },
    PutCommand: jest.fn(),
    GetCommand: jest.fn(),
    QueryCommand: jest.fn(),
    ScanCommand: jest.fn(),
    DeleteCommand: jest.fn(),
    UpdateCommand: jest.fn(),
}))

// Cleanup após cada teste
afterEach(() => {
    jest.clearAllMocks()
})

// Cleanup global após todos os testes
afterAll(async () => {
    // Aguarda um pouco para garantir que todas as operações assíncronas terminem
    await new Promise(resolve => setTimeout(resolve, 100))

    // Limpa timers e handles
    jest.clearAllTimers()

    // Força garbage collection se disponível
    if (global.gc) {
        global.gc()
    }
})
