import { classLogin, fetch } from './api';

export default class Auth {
    public static classLogin(user_id: string, password: string): Promise<any> {
        return fetch.post(classLogin, {
            user_id,
            password,
        });
    }
}
