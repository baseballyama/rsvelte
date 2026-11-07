import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { base } from '$app/paths';
import { lang, ripple } from '$lib/Stores';
import Ripple from 'svelte-ripple';

var root = $.from_html(`<!> <a href="https://github.com/matt8707/ha-fusion/releases" target="_blank" class="svelte-1qqrdc9"> </a>`, 1);
var root_1 = $.from_html(`<div class="svelte-1qqrdc9"><span><h2>Version</h2> <p class="svelte-1qqrdc9"><!></p></span> <button class="action done svelte-1qqrdc9"> </button></div>`);

export default function Version($$anchor, $$props) {
	$.push($$props, true);

	const $lang = () => $.store_get(lang, '$lang', $$stores);
	const $ripple = () => $.store_get(ripple, '$ripple', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
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

	var div = root_1();
	var span = $.child(div);
	var p = $.sibling($.child(span), 2);
	var node = $.child(p);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					var text = $.text();

					$.template_effect(($0) => $.set_text(text, `${$0 ?? ''} ${latest ?? ''}`), [() => $lang()('update_available')]);
					$.append($$anchor, text);
				};

				var d = $.derived(() => compare(installed, latest) > 0);

				var alternate = ($$anchor) => {
					var text_1 = $.text();

					$.template_effect(($0) => $.set_text(text_1, `${$0 ?? ''} ${installed ?? ''}`), [() => $lang()('update_up_to_date')]);
					$.append($$anchor, text_1);
				};

				$.if(node_1, ($$render) => {
					if ($.get(d)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			var a = $.sibling(node_1, 2);
			var text_2 = $.only_child(a, true);

			$.template_effect(($0) => $.set_text(text_2, $0), [() => $lang()('update_release_notes')]);
			$.append($$anchor, fragment);
		};

		var consequent_2 = ($$anchor) => {
			var text_3 = $.text();

			$.template_effect(($0) => $.set_text(text_3, `${$0 ?? ''}: ${error_code ?? ''}`), [() => $lang()('error')]);
			$.append($$anchor, text_3);
		};

		var alternate_1 = ($$anchor) => {
			var text_4 = $.text();

			$.template_effect(($0) => $.set_text(text_4, $0), [() => $lang()('loading')]);
			$.append($$anchor, text_4);
		};

		$.if(node, ($$render) => {
			if (installed && latest) $$render(consequent_1); else if (error_code) $$render(consequent_2, 1); else $$render(alternate_1, -1);
		});
	}

	$.reset(p);
	$.reset(span);

	var button = $.sibling(span, 2);
	var text_5 = $.only_child(button, true);

	$.effect(() => $.event('click', button, $.preventDefault(() => {
		busy = true;
		fetchLatest();
	})));

	$.action(button, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), () => ({ ...$ripple(), color: 'rgba(0, 0, 0, 0.35)' }));
	$.reset(div);
	$.template_effect(($0) => $.set_text(text_5, $0), [() => $lang()(busy ? 'checking_updates' : 'check_updates')]);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}