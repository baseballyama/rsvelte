import * as $ from 'svelte/internal/server';

export default function Rich_text_block($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { block } = $$props;

		$$renderer.push(`<div class="w-full">${$.html(block.metadata.html)}</div>`);
	});
}