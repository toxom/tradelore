import { writable, get } from 'svelte/store';
import { pb } from '$lib/pocketbase';
import { currentUser } from '$lib/pocketbase';
import { browser } from '$app/environment';
import countriesData from 'world-countries';
import { Languages, CalendarClock, Currency, Earth } from 'lucide-svelte';
import type { ComponentType } from 'svelte'; 
type LangCode = 'en' | 'ru';

// Define supported languages
export const languages: Array<{ code: LangCode; label: string; icon: ComponentType; name: string }> = [
    { code: 'en', name: 'English', label: '🇬🇧', icon: Languages },
    { code: 'ru', name: 'Русский', label: '🇷🇺', icon: Languages }
];

// Define supported countries
export const countries = countriesData.map((country) => ({
    code: country.cca2,
    name: country.name.common,
    label: country.flag,
}));

// Define supported timezones
export const timezones: Array<{ code: string; name: string; icon: ComponentType; label: string }> = [
    { code: 'UTC', name: 'Coordinated Universal Time', label: 'GMT+0', icon: CalendarClock },
    { code: 'GMT', name: 'Greenwich Mean Time', label: 'GMT+0', icon: CalendarClock  },
    { code: 'CET', name: 'Central European Time', label: 'GMT+1', icon: CalendarClock  },
    { code: 'EET', name: 'Eastern European Time', label: 'GMT+2', icon: CalendarClock  },
    { code: 'MSK', name: 'Moscow Standard Time', label: 'GMT+3', icon: CalendarClock  },
    { code: 'EST', name: 'Eastern Standard Time', label: 'GMT-5', icon: CalendarClock  },
    { code: 'CST', name: 'Central Standard Time', label: 'GMT-6', icon: CalendarClock  },
    { code: 'MST', name: 'Mountain Standard Time', label: 'GMT-7', icon: CalendarClock },
    { code: 'PST', name: 'Pacific Standard Time', label: 'GMT-8', icon: CalendarClock  },
    { code: 'JST', name: 'Japan Standard Time', label: 'GMT+9', icon: CalendarClock  },
    { code: 'CCT', name: 'China Standard Time', label: 'GMT+8', icon: CalendarClock  },
    { code: 'HKT', name: 'Hong Kong Time', label: 'GMT+8', icon: CalendarClock  },
    { code: 'GST', name: 'Gulf Standard Time', label: 'GMT+4', icon: CalendarClock  },
    { code: 'IST', name: 'Indian Standard Time', label: 'GMT+5:30', icon: CalendarClock  },
    { code: 'AEST', name: 'Australian Eastern Standard Time', label: 'GMT+10', icon: CalendarClock  },
    { code: 'SAST', name: 'South African Standard Time', label: 'GMT+2', icon: CalendarClock  },
    { code: 'BRT', name: 'Brasilia Time', label: 'GMT-3', icon: CalendarClock  },
    { code: 'EDT', name: 'Eastern Daylight Time', label: 'GMT-4', icon: CalendarClock  },
    { code: 'CDT', name: 'Central Daylight Time', label: 'GMT-5', icon: CalendarClock  },
    { code: 'MDT', name: 'Mountain Daylight Time', label: 'GMT-6' , icon: CalendarClock },
    { code: 'PDT', name: 'Pacific Daylight Time', label: 'GMT-7', icon: CalendarClock  },
    { code: 'NZST', name: 'New Zealand Standard Time', label: 'GMT+12', icon: CalendarClock  },
    { code: 'HST', name: 'Hawaii Standard Time', label: 'GMT-10', icon: CalendarClock  },
    { code: 'ART', name: 'Argentina Time', label: 'GMT-3' , icon: CalendarClock },
];

// Define supported currencies
export const currencies: Array<{ code: string; name: string; icon: ComponentType; label: string }> = [
    { code: 'USD', name: 'United States Dollar', label: '$' },
    { code: 'EUR', name: 'Euro', label: '€' },
    { code: 'RUB', name: 'Russian Ruble', label: '₽'  },
    { code: 'CNY', name: 'Chinese Yuan', label: '¥' },
    { code: 'BTC', name: 'Bitcoin', label: '₿' },
    { code: 'ETH', name: 'Ethereum', label: 'Ξ' },
    { code: 'USDT', name: 'Tether', label: '💲'  },
    { code: 'XRP', name: 'Ripple', label: '✕' },
    { code: 'SOL', name: 'Solana', label: '◎' }
];

// Store factory function for preferences
function createPreferenceStore<T>(key: string, defaultValue: T) {
    const { subscribe, set, update } = writable<T>(defaultValue);

    async function initialize() {
        if (browser) {
            const user = get(currentUser);
            if (user) {
                try {
                    const userData = await pb.collection('users').getOne(user.id);
                    if (userData[key] !== undefined) {
                        set(userData[key]);
                    }
                } catch (error) {
                    console.error(`Error loading ${key} preference:`, error);
                }
            }
        }
    }

    async function setPreference(value: T) {
        if (browser) {
            set(value);

            const user = get(currentUser);
            if (user) {
                try {
                    await pb.collection('users').update(user.id, { [key]: value });
                } catch (error) {
                    console.error(`Error saving ${key} preference:`, error);
                }
            }
        }
    }

    return {
        subscribe,
        set: setPreference,
        initialize,
    };
}

// Create stores for each preference
export const currentLanguage = createPreferenceStore<LangCode>('languagePreference', languages[0].code);
export const currentTimezone = createPreferenceStore<string>('timezone', timezones[0].code);
export const currentCurrency = createPreferenceStore<string>('defaultCurrency', currencies[0].code);
export const currentCountry = createPreferenceStore<string>('residence', countries[0].code);

// Initialize preferences when user state changes
if (browser) {
    currentUser.subscribe(() => {
        currentLanguage.initialize();
        currentTimezone.initialize();
        currentCurrency.initialize();
        currentCountry.initialize();
    });
}