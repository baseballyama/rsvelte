import * as $ from 'svelte/internal/server';
import { toast } from '$lib/index.js';
import CodeBlock from './CodeBlock.svelte';

export default function Position($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const positions = [
			'top-left',
			'top-center',
			'top-right',
			'bottom-left',
			'bottom-center',
			'bottom-right'
		];

		let { position, setPosition } = $$props;

		$$renderer.push(`<div><h2>Position</h2> <p>Swipe direction changes depending on the position.</p> <div class="buttons"><!--[-->`);

		const each_array = $.ensure_array_like(positions);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let pos = each_array[$$index];

			$$renderer.push(`<button${$.attr('data-active', position === pos)} class="button">${$.escape(pos)}</button>`);
		}

		$$renderer.push(`<!--]--></div> `);
		CodeBlock($$renderer, { code: `<Toaster position="${position}" />` });
		$$renderer.push(`<!----></div>`);
	});
}