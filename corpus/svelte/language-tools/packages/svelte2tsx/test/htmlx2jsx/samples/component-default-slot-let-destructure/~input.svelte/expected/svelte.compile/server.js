import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	Component($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { thing: { a } }) => {
				$$renderer.push(`<h1>Hello ${$.escape(a)}</h1>`);
			}
		}
	});
}