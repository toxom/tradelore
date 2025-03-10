import { tick } from 'svelte';
import { get } from 'svelte/store';
import {
    currentCountry,
    currentCurrency,
    currentTimezone,
    countries,
    currencies,
    timezones,
} from '../stores/preferences.store';

let showCountryNotification = false;
let showCurrencyNotification = false;
let showTimezoneNotification = false;

let selectedCountryName = '';
let selectedCurrencyName = '';
let selectedTimezoneName = '';

export async function handleCountryChange(event: CustomEvent<{ code: string }>) {
    const selectedCode = event.detail.code;
    await currentCountry.set(selectedCode);

    // Update selected country name for UI
    const country = countries.find((c) => c.code === selectedCode);
    if (country) {
        selectedCountryName = country.name;
    }

    // Show notification
    showCountryNotification = true;
    setTimeout(() => {
        showCountryNotification = false;
    }, 600);
}

export async function handleCurrencyChange() {
    const current = get(currentCurrency);
    const currentIndex = currencies.findIndex((curr) => curr.code === current);
    const nextIndex = (currentIndex + 1) % currencies.length;
    const nextCurrency = currencies[nextIndex];

    await currentCurrency.set(nextCurrency.code); // Use the store's `set` method
    selectedCurrencyName = nextCurrency.name;

    // Show notification
    showCurrencyNotification = true;
    setTimeout(() => {
        showCurrencyNotification = false;
    }, 600);
}

export async function handleTimezoneChange() {
    const current = get(currentTimezone);
    const currentIndex = timezones.findIndex((tz) => tz.code === current);
    const nextIndex = (currentIndex + 1) % timezones.length;
    const nextTimezone = timezones[nextIndex];

    await currentTimezone.set(nextTimezone.code);
    selectedTimezoneName = nextTimezone.name;

    // Show notification
    showTimezoneNotification = true;
    setTimeout(() => {
        showTimezoneNotification = false;
    }, 600);
}