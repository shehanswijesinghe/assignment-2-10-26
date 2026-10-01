type Level = 'debug' | 'info' | 'warn' | 'error';
const ORDER: Record<Level, number> = {debug: 10, info: 20, warn: 30, error: 40};

const configured = process.env.NEXT_PUBLIC_LOG_LEVEL as Level | undefined;
const min = ORDER[configured ?? 'debug'] ?? ORDER.debug;

export function reportError(_event: string, _entry: Record<string, unknown>): void {

}

function emit(level: Level, event: string, ctx?: Record<string, unknown>) {
    if (ORDER[level] < min) return;

    const entry = {
        ts: new Date().toISOString(),
        level,
        event,
        ...ctx
    };
    console[level](`[app] ${event}`, entry);

    if (level === 'error') {
        reportError(event, entry)
    }
}

export const logger = {
    debug: (event: string, ctx?: Record<string, unknown>) => emit('debug', event, ctx),
    info: (event: string, ctx?: Record<string, unknown>) => emit('info', event, ctx),
    warn: (event: string, ctx?: Record<string, unknown>) => emit('warn', event, ctx),
    error: (event: string, ctx?: Record<string, unknown>) => emit('error', event, ctx),
};
