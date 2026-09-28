import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { listen } from '@tauri-apps/api/event';
import { onDestroy, onMount, SvelteComponent } from 'svelte';
import { browser } from '$app/environment';
import { NotificationList, ScrollbarContainer } from '$lib/components';
import { settings, theme } from '$lib/stores';
import 'overlayscrollbars/overlayscrollbars.css';

var root = $.from_html(`<main class="main svelte-15f85af"><!></main>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $settings = () => $.store_get(settings, '$settings', $$stores);
	const $theme = () => $.store_get(theme, '$theme', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
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
					document.documentElement.setAttribute('data-theme', $theme());
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

	var main = root();
	var node = $.child(main);

	$.bind_this(
		ScrollbarContainer(node, {
			margin: '1rem 0.25rem',
			children: ($$anchor, $$slotProps) => {
				NotificationList($$anchor, {
					get notifications() {
						return notifications;
					}
				});
			},
			$$slots: { default: true }
		}),
		($$value) => scrollContainer = $$value,
		() => scrollContainer
	);

	$.reset(main);
	$.append($$anchor, main);
	$.pop();
	$$cleanup();
}