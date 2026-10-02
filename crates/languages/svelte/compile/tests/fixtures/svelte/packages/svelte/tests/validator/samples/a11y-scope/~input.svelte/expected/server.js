import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<th scope=""></th> `);

	$.element($$renderer, Math.random() ? 'th' : 'td', () => {
		$$renderer.push(` scope=""`);
	});

	$$renderer.push(` <div scope=""></div>`);
}