import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	SomeComponent($$renderer, { attr: shorthand });
	$$renderer.push(`<!----> `);
	SomeComponent($$renderer, { attr: shorthand });
	$$renderer.push(`<!---->`);
}