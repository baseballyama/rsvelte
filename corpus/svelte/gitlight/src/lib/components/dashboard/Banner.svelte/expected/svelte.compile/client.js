import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy, onMount } from 'svelte';
import { cubicInOut } from 'svelte/easing';
import { browser } from '$app/environment';
import { page } from '$app/stores';
import { storage } from '$lib/features';
import { openDesktopApp } from '$lib/helpers';
import { CrossIcon, ExclamationMarkIcon } from '$lib/icons';
import { DownloadButton } from '../landing';

var root = $.from_html(`<div class="banner svelte-1gwi47l"><button class="content svelte-1gwi47l"><!> Download or open the desktop app</button> <button class="close svelte-1gwi47l"><!></button></div>`);

export default function Banner($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
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
		const githubAccessToken = $page().data.session?.githubAccessToken;
		const gitlabAccessToken = $page().data.session?.gitlabAccessToken;
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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			DownloadButton($$anchor, {
				get show() {
					return canDownload;
				},
				position: 'bottom',
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var button = $.child(div);
					var node_1 = $.child(button);

					ExclamationMarkIcon(node_1, {});
					$.next();
					$.reset(button);

					var button_1 = $.sibling(button, 2);
					var node_2 = $.child(button_1);

					CrossIcon(node_2, {});
					$.reset(button_1);
					$.reset(div);
					$.event('click', button, handleClick);
					$.event('click', button_1, handleClose);
					$.transition(3, div, () => slide);
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if (show) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}