import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getAPIKeys } from '$lib/common/apiFunctions.svelte';
import { APIKey } from '$lib/common/classes';
import { alertStore, APIKeyStore } from '$lib/common/stores';
import { onMount } from 'svelte';

var root = $.from_html(`<button type="button" class="tooltip"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></button>`);

export default function APIKeyTimeLeft($$anchor, $$props) {
	$.push($$props, true);

	const $APIKeyStore = () => $.store_get(APIKeyStore, '$APIKeyStore', $$stores);
	const $alertStore = () => $.store_get(alertStore, '$alertStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let keyList = [new APIKey()];
	let timeLeftWarning = false;
	let timeLeftTip = '';

	function getAPIKeysAction() {
		getAPIKeys().then((keys) => {
			keyList = keys;

			// match up the current apikey to the keylist
			keyList.forEach((key) => {
				if ($APIKeyStore().includes(key.prefix)) {
					timeLeft(new Date(key.expiration));
				}
			});
		}).catch((error) => {
			$.store_set(alertStore, error);
		});
	}

	// sets time expiry in human readable format
	function timeLeft(date) {
		let currentTime = new Date();

		// gets time difference in seconds
		let timeDifferenceDays = Math.round((date.getTime() - currentTime.getTime()) / 1000 / 60 / 60 / 24);

		if (timeDifferenceDays < 30) {
			$.store_set(alertStore, `${timeDifferenceDays} days left before API Key expiry, consider rolling your key`);
			timeLeftWarning = true;
		}

		timeLeftTip = `${timeDifferenceDays} days left before expiry`;
	}

	onMount(() => {
		getAPIKeysAction();
	});

	var button = root();
	var svg = $.child(button);
	let classes;

	$.reset(button);

	$.template_effect(() => {
		$.set_attribute(button, 'data-tip', timeLeftTip);
		classes = $.set_class(svg, 0, 'h-5 w-5 inline', null, classes, { 'stroke-error': timeLeftWarning });
	});

	$.append($$anchor, button);
	$.pop();
	$$cleanup();
}