import * as $ from 'svelte/internal/server';
import marked from 'marked';

export default function Textarea_inputs_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = `Some words are *italic*, some are **bold**`;

		$$renderer.push(`<textarea class="svelte-hcsj82">`);

		const $$body = $.escape(value);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea> ${$.html(marked(value))}`);
	});
}