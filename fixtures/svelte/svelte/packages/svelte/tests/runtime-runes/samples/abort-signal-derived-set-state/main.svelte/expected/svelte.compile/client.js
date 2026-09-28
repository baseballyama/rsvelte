import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getAbortSignal } from "svelte";

var root = $.from_html(` <button></button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let aborted = $.state(0);
	let count = $.state(0);

	let der = $.derived(() => {
		const signal = getAbortSignal();

		signal.addEventListener("abort", () => {
			try {
				$.update(aborted);
			} catch(e) {
				console.error(e);
			}
		});

		return $.get(count);
	});

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);
	var button = $.sibling(text);

	$.template_effect(() => $.set_text(text, `${$.get(der) ?? ''}:${$.get(aborted) ?? ''} `));
	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);