import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tick } from 'svelte';

var root = $.from_html(`<textarea class="svelte-1qerbln"></textarea>`);

export default function Tick_input($$anchor, $$props) {
	$.push($$props, true);

	let text = `Select some text and hit the tab key to toggle uppercase`;

	async function handleKeydown(event) {
		if (event.key !== 'Tab') return;

		event.preventDefault();

		const { selectionStart, selectionEnd, value } = this;
		const selection = value.slice(selectionStart, selectionEnd);
		const replacement = (/[a-z]/).test(selection) ? selection.toUpperCase() : selection.toLowerCase();

		text = value.slice(0, selectionStart) + replacement + value.slice(selectionEnd);

		// this has no effect, because the DOM hasn't updated yet
		await tick();

		this.selectionStart = selectionStart;
		this.selectionEnd = selectionEnd;
	}

	var textarea = root();

	$.remove_textarea_child(textarea);
	$.template_effect(() => $.set_value(textarea, text));
	$.event('keydown', textarea, handleKeydown);
	$.append($$anchor, textarea);
	$.pop();
}