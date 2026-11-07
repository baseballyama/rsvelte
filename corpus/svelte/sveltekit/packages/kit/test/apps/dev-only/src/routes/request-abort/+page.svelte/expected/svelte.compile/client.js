import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var root = $.from_html(`<pre> </pre>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let result;

	function test_abort() {
		const controller = new AbortController();

		fetch('/request-abort', { method: 'POST', signal: controller.signal }).then((r) => r.json());

		setTimeout(
			async () => {
				controller.abort();

				// the server doesn't necessarily observe the abort immediately, so poll the
				// status endpoint until it reports that the request was aborted
				for (let i = 0; i < 50; i += 1) {
					const r = await fetch('/request-abort', { headers: { accept: 'application/json' } });

					result = await r.json();

					if (result && 'aborted' in result && result.aborted) return;

					await new Promise((r) => setTimeout(r, 50));
				}
			},
			50
		);
	}

	onMount(test_abort);

	var pre = root();
	var text = $.only_child(pre, true);

	$.template_effect(($0) => $.set_text(text, $0), [() => JSON.stringify(result)]);
	$.append($$anchor, pre);
	$.pop();
}