import * as $ from 'svelte/internal/server';
import { Checkbox, Label } from "flowbite-svelte";

export default function Colors($$renderer) {
	$$renderer.push(`<div class="flex flex-col gap-4 sm:flex-row">`);

	Checkbox($$renderer, {
		checked: true,
		color: 'red',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Red`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Checkbox($$renderer, {
		checked: true,
		color: 'green',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Green`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Checkbox($$renderer, {
		checked: true,
		color: 'purple',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Purple`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Checkbox($$renderer, {
		checked: true,
		color: 'teal',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Teal`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Checkbox($$renderer, {
		checked: true,
		color: 'yellow',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Yellow`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Checkbox($$renderer, {
		checked: true,
		color: 'orange',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Orange`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Label($$renderer, {
		class: 'flex items-center',
		children: ($$renderer) => {
			Checkbox($$renderer, {
				checked: true,
				inline: true,
				class: 'text-sky-400 focus:ring-pink-500'
			});

			$$renderer.push(`<!----> Your custom color`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}