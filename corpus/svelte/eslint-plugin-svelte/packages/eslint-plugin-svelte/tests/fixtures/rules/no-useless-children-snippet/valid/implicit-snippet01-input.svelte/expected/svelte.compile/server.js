import * as $ from 'svelte/internal/server';

export default function Implicit_snippet01_input($$renderer) {
	Foo($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Hello`);
		},
		$$slots: { default: true }
	});
}