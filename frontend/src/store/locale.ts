import {create} from 'zustand';
import {persist} from 'zustand/middleware';

interface LocalState {
    locale: Locale;
    setLocale: (l: Locale) => void
}

export type Locale = 'en-GB' | 'en-US' | 'si-LK';

export const LOCALES: { value: Locale; label: string }[] = [
    {value: 'en-GB', label: 'English (UK)'},
    {value: 'en-US', label: 'English (US)'},
    {value: 'si-LK', label: 'සිංහල'},
];

export const useLocaleStore = create<LocalState>()(
    persist(
        (set) => ({
            locale: 'en-GB',
            setLocale: (locale) => set({locale})
        }),
        {name: 'locale', skipHydration: true}
    ),
);
