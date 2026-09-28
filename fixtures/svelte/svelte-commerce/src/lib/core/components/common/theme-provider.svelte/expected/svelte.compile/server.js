import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { onMount } from 'svelte';

export default function Theme_provider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function updateThemeVariables() {
			const root = document.documentElement;

			// Apply theme colors from settings if available
			if (page?.data?.store.themePrimaryColor) {
				root.style.setProperty('--color-theme-1', page?.data?.store.themePrimaryColor);
			}

			if (page?.data?.store.themeSecondaryColor) {
				root.style.setProperty('--color-theme-2', page?.data?.store.themeSecondaryColor);
			}

			if (page?.data?.store.themeFontColor) {
				root.style.setProperty('--color-text', page?.data?.store.themeFontColor);
			}

			if (page?.data?.store.themeFontFamily) {
				root.style.setProperty('--font-body', page?.data?.store.themeFontFamily);
			}
		}

		// Update whenever the selectedStore changes
		onMount(() => {
			// Apply initially
			updateThemeVariables();
		});
	});
}