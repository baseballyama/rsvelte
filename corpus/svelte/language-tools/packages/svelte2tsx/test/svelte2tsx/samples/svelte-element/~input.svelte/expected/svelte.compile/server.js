import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let tag = 'div';

	$.element($$renderer, tag);
	$$renderer.push(` `);
	$.element($$renderer, 'tag');
	$$renderer.push(` `);
	$.element($$renderer, tag ? 'a' : 'b');
	$$renderer.push(` `);

	$.element($$renderer, tag, void 0, () => {
		$$renderer.push(`div`);
	});

	$$renderer.push(` `);
	$.element($$renderer, tag);
	$$renderer.push(` `);

	$.element($$renderer, 'a', () => {
		$$renderer.push(` data-sveltekit-preload-data="" href="https://kit.svelte.dev"`);
	});
}