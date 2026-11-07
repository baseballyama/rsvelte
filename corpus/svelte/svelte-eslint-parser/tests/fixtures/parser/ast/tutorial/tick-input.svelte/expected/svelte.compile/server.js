import * as $ from 'svelte/internal/server';
import { tick } from 'svelte';

export default function Tick_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		$$renderer.push(`<textarea class="svelte-1qerbln">`);

		const $$body = $.escape(text);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea>`);
	});
}