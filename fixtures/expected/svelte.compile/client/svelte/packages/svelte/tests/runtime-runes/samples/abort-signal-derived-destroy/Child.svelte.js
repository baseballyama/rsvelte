import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getAbortSignal } from "svelte";

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	let aborted = $.prop($$props, 'aborted', 15);

	let der = $.derived(() => {
		const signal = getAbortSignal();

		signal.addEventListener("abort", () => {
			try {
				$.update_prop(aborted);
			} catch(e) {
				console.error(e);
			}
		});

		return $$props.count;
	});

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $.get(der)));
	$.append($$anchor, text);
	$.pop();
}