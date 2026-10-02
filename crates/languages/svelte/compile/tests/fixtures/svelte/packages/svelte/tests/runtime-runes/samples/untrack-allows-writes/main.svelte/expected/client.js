import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { untrack } from "svelte";

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);
	let mirrored = $.state(0);

	let double = $.derived(() => {
		untrack(() => {
			$.set(mirrored, $.get(count), true);
		});

		return $.get(count) * 2;
	});

	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `${$.get(count) ?? ''} ${$.get(mirrored) ?? ''} ${$.get(double) ?? ''}`));
	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);