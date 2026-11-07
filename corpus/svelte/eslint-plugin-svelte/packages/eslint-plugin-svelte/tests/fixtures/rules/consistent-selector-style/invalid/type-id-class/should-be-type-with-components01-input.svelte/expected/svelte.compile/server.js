import * as $ from 'svelte/internal/server';
import MyComponent from "./MyComponent.svelte";

export default function Should_be_type_with_components01_input($$renderer) {
	$$renderer.push(`<a class="link svelte-uy77io">Click me!</a> <a class="link svelte-uy77io">Click me two!</a> `);

	MyComponent($$renderer, {
		class: 'link',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Component`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <b class="bold svelte-uy77io">Text 1</b> <b class="bold svelte-uy77io" data-key="val">Text 2</b> `);

	MyComponent($$renderer, {
		class: 'bold',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Component`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <i id="italic" class="svelte-uy77io">Italic</i> `);

	MyComponent($$renderer, {
		id: 'italic',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Component`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}