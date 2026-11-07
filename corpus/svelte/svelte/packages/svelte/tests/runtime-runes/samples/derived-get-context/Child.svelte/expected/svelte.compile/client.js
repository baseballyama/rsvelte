import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_html(`<button> </button>`);

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);
	let total = $.derived(() => multiply($.get(count)));

	function multiply(num) {
		const context = getContext("key");

		return num * context;
	}

	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, $.get(total)));
	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);