import { derived } from 'svelte/store';
import { currentLanguage } from './preferences.store';
import en from '$lib/translations/en';
import ru from '$lib/translations/ru';

export const translations = {
	en,
	ru
};

export const t = derived(currentLanguage, ($currentLanguage) => {
	return (key: string) => {
		const keys = key.split('.');
		let value = translations[$currentLanguage];
		for (const k of keys) {
			if (value === undefined) break;
			value = value[k];
		}
		if (value === undefined) {
			console.warn(`Translation key "${key}" not found for language "${$currentLanguage}"`);
			return key;
		}
		return value;
	};
});
