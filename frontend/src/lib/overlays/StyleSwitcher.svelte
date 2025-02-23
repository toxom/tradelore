<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { Moon, Sun, Sunset, Sunrise, Focus, Bold, Gauge, Bone } from 'lucide-svelte';
	import { currentUser, pb } from '$lib/pocketbase';
	import { currentTheme } from '../../stores/theme.store';
	import { t } from '../../stores/translation.store';

	interface Style {
		name: string;
		value: string;
		icon: any;
		description: string;
		dummyContent: string;
	}

	let isDarkMode = false;
	const dispatch = createEventDispatcher();


	async function toggleTheme() {
		isDarkMode = !isDarkMode;
		const newTheme = isDarkMode ? 'dark' : 'light';

		currentTheme.set(newTheme);
		document.body.className = newTheme;

		if ($currentUser) {
			try {
				await pb.collection('users').update($currentUser.id, { theme_preference: newTheme });
			} catch (error) {
				console.error('Failed to save theme preference:', error);
			}
		}

		dispatch('styleChange', { style: newTheme });
	}
	onMount(async () => {
		if ($currentUser) {
			try {
				const user = await pb.collection('users').getOne($currentUser.id);
				if (user.theme_preference) {
					currentTheme.set(user.theme_preference);
					document.body.className = user.theme_preference;
					isDarkMode = user.theme_preference === 'dark';
				}
			} catch (error) {
				console.error('Failed to fetch user theme preference:', error);
			}
		}
	});

</script>

<button on:click={toggleTheme} class="switch">
	<input type="checkbox" bind:checked={isDarkMode}>
	<span class="slider round">
		<span class="icon-wrapper">
			<svelte:component this={isDarkMode ? Moon : Sun} class="icon"/>
		  </span>	</span>
</button>

<style lang="scss">
	@use 'src/styles/themes.scss' as *;

	button {
		background-color: transparent;
		border: none;
	}
	.switch {
	position: relative;
	display: inline-block;
	width: 60px;
	height: 34px;
	cursor: pointer;
	}
	.switch input {
	opacity: 0;
	width: 0;
	height: 0;
	}
	.slider {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	border-radius: 34px;
	border: 1px solid;
	border-color: var(--secondary-color);
	transition: 0.4s;
	display: flex;
	align-items: center;
	justify-content: flex-start;
	padding: 4px;
	background-color: var(--primary-color);
	
	}

	.slider:before {
	content: "";
	height: 26px;
	width: 26px;
	border-radius: 50%;
	transition: 0.4s;
	position: absolute;
	left: 4px;
	border: 1px solid;
	border-color: var(--secondary-color);

	}
	.icon-wrapper {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 26px;
	height: 26px;
	position: absolute;
	z-index: 2;
	color: var(--text-color);
	}
	.icon {
	position: absolute;
	width: 20px;
	height: 20px;
	transition: 0.4s;
	stroke: var(--primary-color);
	}
	input:checked + .slider .icon {
	transform: translateX(25px);
	stroke: var(--highlight-color); 
	}
	input:checked + .slider:before {
	transform: translateX(26px);
	}
	input:checked + .slider .icon {
	transform: translateX(25px);
	}
	.slider.round {
	border-radius: 34px;
	}
	.slider.round:before {
	border-radius: 50%;
	}
</style>