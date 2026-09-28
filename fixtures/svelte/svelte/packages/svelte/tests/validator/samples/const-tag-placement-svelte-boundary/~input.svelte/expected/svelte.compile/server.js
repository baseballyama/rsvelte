import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let a = "";

	$$renderer.push(`<!--[-->`);

	{
		const x = a;

		$$renderer.push(`<!----> `);
		FlakyComponent($$renderer, {});
		$$renderer.push(`<!---->`);
	}

	$$renderer.push(`<!--]-->`);
}