export interface IDatabaseClient {
    scan(params: any): Promise<any>
    get(params: any): Promise<any>
    put(params: any): Promise<any>
    update(params: any): Promise<any>
    delete(params: any): Promise<any>
}

export interface IDatabaseClientFactory {
    createClient(): Promise<IDatabaseClient>
}

export const DATABASE_CLIENT_FACTORY_TOKEN = 'IDatabaseClientFactory'
