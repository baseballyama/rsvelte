import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let Script;
	let Style;

	Script($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<p></p>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Style($$renderer, {});
	$$renderer.push(`<!---->`);
}