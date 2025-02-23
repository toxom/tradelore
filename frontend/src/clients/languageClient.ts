    import { pb } from '$lib/pocketbase';
    import { X, Calculator, Camera, Bell, MapPin, CircleX, LogIn, User, LogOut, MessageCircle, Filter, FilterX } from 'lucide-svelte';
	import { onMount, tick, createEventDispatcher } from 'svelte';

	import { currentLanguage, languages, setLanguage } from '../stores/language.store';
	
    let showLanguageNotification = false;
	let selectedLanguageName = '';
	const dispatch = createEventDispatcher();

    export async function handleLanguageChange() {
		showLanguageNotification = true;

		const currentLang = $currentLanguage;
		const currentIndex = languages.findIndex((lang) => lang.code === currentLang);
		const nextIndex = (currentIndex + 1) % languages.length;
		const nextLanguage = languages[nextIndex];

		await setLanguage(nextLanguage.code);
		selectedLanguageName = nextLanguage.name;

		await tick();

		setTimeout(() => {
			showLanguageNotification = true;
		}, 0);
		setTimeout(() => {
			showLanguageNotification = false;
		}, 600);
	}