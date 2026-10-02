import * as $ from 'svelte/internal/server';
import { Toggle } from "flowbite-svelte";

export default function Sizes($$renderer) {
	const customSize = "w-16 h-10 after:top-1 after:left-[4px]  after:h-8 after:w-8";

	Toggle($$renderer, {
		size: 'small',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Small toggle`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Toggle($$renderer, {
		size: 'default',
		checked: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default toggle`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Toggle($$renderer, {
		size: 'large',
		checked: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Large toggle`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Toggle($$renderer, {
		size: undefined,
		classes: { span: customSize },
		children: ($$renderer) => {
			$$renderer.push(`<!---->Custom toggle`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}