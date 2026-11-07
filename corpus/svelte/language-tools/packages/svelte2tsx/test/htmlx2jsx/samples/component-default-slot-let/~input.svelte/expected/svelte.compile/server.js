import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	Component($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { name: n, thing }) => {
				$$renderer.push(`<h1>Hello ${$.escape(thing)} ${$.escape(n)}</h1>`);
			}
		}
	});
}