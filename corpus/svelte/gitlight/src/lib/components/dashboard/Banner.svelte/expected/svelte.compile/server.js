import * as $ from 'svelte/internal/server';
import { onDestroy, onMount } from 'svelte';
import { cubicInOut } from 'svelte/easing';
import { browser } from '$app/environment';
import { page } from '$app/stores';
import { storage } from '$lib/features';
import { openDesktopApp } from '$lib/helpers';
import { CrossIcon, ExclamationMarkIcon } from '$lib/icons';
import { DownloadButton } from '../landing';

export default function Banner($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let show = false;
		let hasFocus = true;
		let canDownload = false;

		function slide(_) {
			return {
				delay: 0,
				duration: 300,
				css: (t) => `height: ${cubicInOut(t) * 2.5}rem`
			};
		}

		function handleClick() {
			const githubAccessToken = $.store_get($$store_subs ??= {}, '$page', page).data.session?.githubAccessToken;
			const gitlabAccessToken = $.store_get($$store_subs ??= {}, '$page', page).data.session?.gitlabAccessToken;
			const gitlabRefreshToken = storage.get('gitlab-refresh-token');
			const gitlabExpiresIn = storage.get('gitlab-expires-in');
			const gitlabUrl = storage.get('gitlab-url');
			const gitlabPat = storage.get('gitlab-pat');

			if (githubAccessToken || gitlabAccessToken) {
				setTimeout(
					() => {
						if (hasFocus) {
							canDownload = true;
						}
					},
					500
				);

				// Open the app with the access token
				openDesktopApp({
					githubAccessToken,
					gitlabAccessToken,
					gitlabExpiresIn,
					gitlabRefreshToken,
					gitlabUrl,
					gitlabPat
				});
			}
		}

		function handleClose() {
			canDownload = false;
			show = false;
		}

		function handleFocus() {
			hasFocus = true;
		}

		function handleBlur() {
			hasFocus = false;
		}

		onMount(() => {
			show = !window.__TAURI__;
			window.addEventListener('focus', handleFocus);
			window.addEventListener('blur', handleBlur);
		});

		onDestroy(() => {
			if (!browser) return;

			window.removeEventListener('focus', handleFocus);
			window.removeEventListener('blur', handleBlur);
		});

		if (show) {
			$$renderer.push('<!--[0-->');

			DownloadButton($$renderer, {
				show: canDownload,
				position: 'bottom',
				children: ($$renderer) => {
					$$renderer.push(`<div class="banner svelte-1gwi47l"><button class="content svelte-1gwi47l">`);
					ExclamationMarkIcon($$renderer, {});
					$$renderer.push(`<!----> Download or open the desktop app</button> <button class="close svelte-1gwi47l">`);
					CrossIcon($$renderer, {});
					$$renderer.push(`<!----></button></div>`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}