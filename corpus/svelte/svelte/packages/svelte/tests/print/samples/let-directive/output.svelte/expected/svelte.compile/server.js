import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	FancyList($$renderer, {
		items,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { item: processed }) => {
				$$renderer.push(`<div>${$.escape(processed.text)}</div>`);
			}
		}
	});
}