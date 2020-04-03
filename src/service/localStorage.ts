export default class LocalStorage {
    public static get(key: any, defaultValue = null) {
        let stored: any = window.localStorage.getItem(key);
        try {
            stored = JSON.parse(stored);
        } catch (error) {
            stored = null;
        }
        if (defaultValue && stored === null) {
            stored = defaultValue;
        }
        return stored;
    }

    public static update(key: any, value: any) {
        if (value) {
            window.localStorage.setItem(key, JSON.stringify(value));
        }
    }

    public static clear(key: any) {
        localStorage.removeItem(key);
    }
}
