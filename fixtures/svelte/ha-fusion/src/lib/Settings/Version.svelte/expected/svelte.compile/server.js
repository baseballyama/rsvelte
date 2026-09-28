import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { base } from '$app/paths';
import { lang, ripple } from '$lib/Stores';
import Ripple from 'svelte-ripple';

export default function Version($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const debug = false;
		let installed;
		let latest;
		let last_updated;
		let timeout;
		let busy = false;
		let error_code;

		onMount(async () => {
			try {
				const response = await fetch(`${base}/_api/version`, { headers: { 'Content-Type': 'application/json' } });
				const data = await response.json();

				const diff = data?.last_updated
					? new Date().getTime() - new Date(data.last_updated).getTime()
					: Infinity;

				// fetch new data if missing or older than a day
				if (diff > 86400000) {
					if (debug) console.debug('stale version');

					installed = data?.installed;
					await fetchLatest();
				} else {
					installed = data?.installed;
					latest = data?.latest;
					last_updated = data?.last_updated;

					if (debug) console.debug('version loaded from file:', latest);
				}
			} catch(err) {
				console.error(err);
			}
		});

		async function fetchLatest() {
			clearTimeout(timeout);

			try {
				if (debug) console.debug('fetching latest version from github');

				const url = 'https://api.github.com/repos/matt8707/ha-fusion/releases/latest';
				const response = await fetch(url);

				if (!response.ok) {
					error_code = response.status;
					console.error(response.status);
				}

				const data = await response.json();

				latest = data?.tag_name;

				// save latest data
				if (latest) save(latest);
			} catch(err) {
				console.error(err);
			}
		}

		async function save(latest) {
			try {
				if (debug) console.debug('saving version file');

				last_updated = new Date().toISOString();

				const response = await fetch(`${base}/_api/version`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ latest, installed, last_updated })
				});

				const result = await response.json();

				if (result?.message === 'success') {
					// add frontend ui response
					if (debug) console.debug('version file saved');
				}
			} catch(err) {
				console.error(err);
			} finally {
				timeout = setTimeout(
					() => {
						busy = false;
					},
					750
				);
			}
		}

		function compare(installed, latest) {
			return latest.localeCompare(installed, undefined, { numeric: true, sensitivity: 'base' });
		}

		$$renderer.push(`<div class="svelte-1qqrdc9"><span><h2>Version</h2> <p class="svelte-1qqrdc9">`);

		if (installed && latest) {
			$$renderer.push('<!--[0-->');

			if (compare(installed, latest) > 0) {
				$$renderer.push(`<!--[0-->${$.escape($.store_get($$store_subs ??= {}, '$lang', lang)('update_available'))} ${$.escape(latest)}`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape($.store_get($$store_subs ??= {}, '$lang', lang)('update_up_to_date'))} ${$.escape(installed)}`);
			}

			$$renderer.push(`<!--]--> <a href="https://github.com/matt8707/ha-fusion/releases" target="_blank" class="svelte-1qqrdc9">${$.escape($.store_get($$store_subs ??= {}, '$lang', lang)('update_release_notes'))}</a>`);
		} else if (error_code) {
			$$renderer.push(`<!--[1-->${$.escape($.store_get($$store_subs ??= {}, '$lang', lang)('error'))}: ${$.escape(error_code)}`);
		} else {
			$$renderer.push(`<!--[-1-->${$.escape($.store_get($$store_subs ??= {}, '$lang', lang)('loading'))}`);
		}

		$$renderer.push(`<!--]--></p></span> <button class="action done svelte-1qqrdc9">${$.escape($.store_get($$store_subs ??= {}, '$lang', lang)(busy ? 'checking_updates' : 'check_updates'))}</button></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}