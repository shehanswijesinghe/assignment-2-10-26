import axios, {AxiosError} from 'axios';
import {logger} from '@/lib/logger';
import {useAuthStore} from '@/store/auth';
import {useLocaleStore} from '@/store/locale';
import {ApiEnvelope, ApiError} from './types';

export const http = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 15_000,
});

const newRequestId = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

http.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers['Accept-Language'] = useLocaleStore.getState().locale;
    config.headers['X-Request-Id'] = newRequestId();
    return config;
});

http.interceptors.response.use(
    (res) => res,
    (error: AxiosError<ApiEnvelope>) => {
        const status = error.response?.status ?? 0;
        const body = error.response?.data;
        const code = body?.code ?? (error.response ? 'internal.error' : 'network.error');
        const requestId = (error.response?.headers?.['x-request-id'] as string | undefined) ?? (error.config?.headers?.['X-Request-Id'] as string | undefined);

        const logLevel = status === 0 || status >= 500 ? 'error' : 'warn';
        logger[logLevel]('api.error', {
            method: error.config?.method?.toUpperCase(),
            url: error.config?.url,
            status,
            code,
            requestId,
            fields: body?.details?.map((d) => `${d.field}:${d.code}`),
        });

        if (status === 401 && code === 'auth.unauthorized' && useAuthStore.getState().token) {
            useAuthStore.getState().clear();

            if (typeof window !== 'undefined') {
                window.location.assign('/login');
            }
        }
        return Promise.reject(new ApiError(code, status, body?.details, requestId));
    },
);
