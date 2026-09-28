import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="flex items-center gap-4"><input type="text" class="input"/> <button class="btn preset-filled">Copy</button></div>`);

export default function Input($$anchor) {
	let value = $.state('Hello Skeleton');

	async function handleCopy() {
		await navigator.clipboard.writeText($.get(value));
		alert(`Copied "${$.get(value)}" to clipboard!`);
	}

	var div = root();
	var input = $.child(div);

	$.remove_input_defaults(input);

	var button = $.sibling(input, 2);

	$.reset(div);
	$.bind_value(input, () => $.get(value), ($$value) => $.set(value, $$value));
	$.delegated('click', button, handleCopy);
	$.append($$anchor, div);
}

$.delegate(['click']);