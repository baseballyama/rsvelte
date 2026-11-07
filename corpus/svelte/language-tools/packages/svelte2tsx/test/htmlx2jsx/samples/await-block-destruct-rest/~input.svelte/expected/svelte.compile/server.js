import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$.await($$renderer, object, () => {}, ({ a, ...rest }) => {
		$$renderer.push(`then`);
	});

	$$renderer.push(`<!--]--> `);

	$.await($$renderer, array, () => {}, ([a, b, ...rest]) => {
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