export class Urls {

    static host = 'HITCHHIKER_APP_HOST';

    static getUrl(action: string): string {
        return `${Urls.host}api/${action}`;
    }

    static getWebSocket(action: string): string {
        return `ws${Urls.host.substr(4)}${action}`;
    }
} 