/**
 * Système de logging pour le Frontend (React Native / Expo)
 * Pour l'instant, redirige vers la console de manière propre.
 * Peut être étendu pour envoyer les logs vers un serveur Sentry ou un backend.
 */

const IS_DEV = __DEV__;

export const logger = {
    info: (message: string, ...args: any[]) => {
        if (IS_DEV) {
            console.log(`[INFO] ${message}`, ...args);
        }
    },
    warn: (message: string, ...args: any[]) => {
        if (IS_DEV) {
            console.warn(`[WARN] ${message}`, ...args);
        }
    },
    error: (message: string, ...args: any[]) => {
        if (IS_DEV) {
            console.error(`[ERROR] ${message}`, ...args);
        }
    },
    debug: (message: string, ...args: any[]) => {
        if (IS_DEV) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    }
};

export default logger;
