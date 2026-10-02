import * as $ from 'svelte/internal/server';
import MyComponent from "./MyComponent.svelte";

export default function Should_be_id_with_components01_input($$renderer) {
	$$renderer.push(`<a class="link svelte-d2y4w7">Click me!</a> `);

	MyComponent($$renderer, {
		class: 'link',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Component`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <a>Click me two!</a> <b class="bold svelte-d2y4w7">Text 1</b> `);

	MyComponent($$renderer, {
		class: 'bold',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Component`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <b data-key="val">Text 3</b>`);
}