import { currentLanguage, languages } from '../stores/preferences.store';
import { tick } from 'svelte';

let showLanguageNotification = false;
let selectedLanguageName = '';

export async function handleLanguageChange(event: CustomEvent<string>) {
    showLanguageNotification = true;

    const languageCode = event.detail; // Extract the language code from the event

    const language = languages.find((lang) => lang.code === languageCode);

    if (language) {
        await currentLanguage.set(language.code); // Use the store's `set` method
        selectedLanguageName = language.name;

        await tick();

        setTimeout(() => {
            showLanguageNotification = true;
        }, 0);
        setTimeout(() => {
            showLanguageNotification = false;
        }, 600);
    }
}