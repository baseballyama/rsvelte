import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$.await($$renderer, object, () => {}, ({ a = 3, b = 4, c }) => {
		$$renderer.push(`then`);
	});

	$$renderer.push(`<!--]--> `);

	$.await($$renderer, array, () => {}, ([a, b, c = 3]) => {
		$$renderer.push(`then`);
	});

	$$renderer.push(`<!--]--> `);

	$.await($$renderer, objectReject, () => {}, (value) => {
		$$renderer.push(`then`);
	});

	$$renderer.push(`<!--]--> `);

	$.await($$renderer, arrayReject, () => {}, (value) => {
		$$renderer.push(`then`);
	});

	$$renderer.push(`<!--]-->`);
}