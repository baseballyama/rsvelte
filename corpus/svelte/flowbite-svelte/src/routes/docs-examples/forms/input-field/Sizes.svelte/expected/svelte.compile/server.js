import * as $ from 'svelte/internal/server';
import { Input, Label } from "flowbite-svelte";

export default function Sizes($$renderer) {
	Label($$renderer, {
		class: 'space-y-2',
		children: ($$renderer) => {
			$$renderer.push(`<div>Small icon input</div> `);
			Input($$renderer, { type: 'email', placeholder: 'Small input', size: 'sm' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Label($$renderer, {
		class: 'space-y-2',
		children: ($$renderer) => {
			$$renderer.push(`<div>Default icon input</div> `);
			Input($$renderer, { type: 'email', placeholder: 'Default input', size: 'md' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Label($$renderer, {
		class: 'space-y-2',
		children: ($$renderer) => {
			$$renderer.push(`<div>Large icon input</div> `);
			Input($$renderer, { type: 'email', placeholder: 'Large input', size: 'lg' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}