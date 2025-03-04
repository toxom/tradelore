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

export async function handleCountryChange() {
    showCountryNotification = true;

    const current = get(currentCountry);
    const currentIndex = countries.findIndex((c) => c.code === current);
    const nextIndex = (currentIndex + 1) % countries.length;
    const nextCountry = countries[nextIndex];

    await currentCountry.set(nextCountry.code); // Use the store's `set` method
    selectedCountryName = nextCountry.name;

    await tick();

    setTimeout(() => {
        showCountryNotification = true;
    }, 0);
    setTimeout(() => {
        showCountryNotification = false;
    }, 600);
}

export async function handleCurrencyChange() {
    showCurrencyNotification = true;

    const current = get(currentCurrency);
    const currentIndex = currencies.findIndex((curr) => curr.code === current);
    const nextIndex = (currentIndex + 1) % currencies.length;
    const nextCurrency = currencies[nextIndex];

    await currentCurrency.set(nextCurrency.code); // Use the store's `set` method
    selectedCurrencyName = nextCurrency.name;

    await tick();

    setTimeout(() => {
        showCurrencyNotification = true;
    }, 0);
    setTimeout(() => {
        showCurrencyNotification = false;
    }, 600);
}

export async function handleTimezoneChange() {
    showTimezoneNotification = true;

    const current = get(currentTimezone);
    const currentIndex = timezones.findIndex((tz) => tz.code === current);
    const nextIndex = (currentIndex + 1) % timezones.length;
    const nextTimezone = timezones[nextIndex];

    await currentTimezone.set(nextTimezone.code); 
    selectedTimezoneName = nextTimezone.name;

    await tick();

    setTimeout(() => {
        showTimezoneNotification = true;
    }, 0);
    setTimeout(() => {
        showTimezoneNotification = false;
    }, 600);
}