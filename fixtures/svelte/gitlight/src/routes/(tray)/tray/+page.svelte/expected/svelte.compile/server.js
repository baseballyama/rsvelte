import * as $ from 'svelte/internal/server';
import { listen } from '@tauri-apps/api/event';
import { onDestroy, onMount, SvelteComponent } from 'svelte';
import { browser } from '$app/environment';
import { NotificationList, ScrollbarContainer } from '$lib/components';
import { settings, theme } from '$lib/stores';
import 'overlayscrollbars/overlayscrollbars.css';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let notifications = [];
		let scrollContainer;
		let unlistenNotification = () => null;
		let unlistenSettings = () => null;
		let unlistenTheme = () => null;

		function scrollToTop() {
			setTimeout(
				() => {
					scrollContainer?.scrollTo({ top: 0 });
				},
				10
			);
		}

		onMount(async () => {
			if (window.__TAURI__) {
				window.addEventListener('blur', scrollToTop);

				const [a, b, c] = await Promise.all([
					listen('notifications', (event) => {
						notifications = event.payload.notifications;
					}),

					listen('settings', (event) => {
						$.store_set(settings, event.payload.settings);
					}),

					listen('theme', (event) => {
						$.store_set(theme, event.payload.theme);
						document.documentElement.setAttribute('data-theme', $.store_get($$store_subs ??= {}, '$theme', theme));
					})
				]);

				unlistenNotification = a;
				unlistenSettings = b;
				unlistenTheme = c;

				const baseTheme = document.documentElement.getAttribute('data-theme');

				if (baseTheme == 'light' || baseTheme == 'dark') {
					$.store_set(theme, baseTheme);
				}
			}
		});

		onDestroy(() => {
			if (browser && window.__TAURI__) {
				window.removeEventListener('blur', scrollToTop);
				unlistenNotification();
				unlistenSettings();
				unlistenTheme();
			}
		});

		$$renderer.push(`<main class="main svelte-15f85af">`);

		ScrollbarContainer($$renderer, {
			margin: '1rem 0.25rem',
			children: ($$renderer) => {
				NotificationList($$renderer, { notifications });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></main>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}