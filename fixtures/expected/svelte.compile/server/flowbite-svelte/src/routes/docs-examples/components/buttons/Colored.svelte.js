import * as $ from 'svelte/internal/server';
import { GradientButton } from "flowbite-svelte";

export default function Colored($$renderer) {
	GradientButton($$renderer, {
		shadow: true,
		color: 'blue',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Blue`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	GradientButton($$renderer, {
		shadow: true,
		color: 'green',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Green`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	GradientButton($$renderer, {
		shadow: true,
		color: 'cyan',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Cyan`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	GradientButton($$renderer, {
		shadow: true,
		color: 'teal',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Teal`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	GradientButton($$renderer, {
		shadow: true,
		color: 'lime',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Lime`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	GradientButton($$renderer, {
		shadow: true,
		color: 'red',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Red`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	GradientButton($$renderer, {
		shadow: true,
		color: 'pink',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Pink`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	GradientButton($$renderer, {
		shadow: true,
		color: 'purple',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Purple`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}