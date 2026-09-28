import * as $ from 'svelte/internal/server';
import { GradientButton } from "flowbite-svelte";

export default function GradientOutline($$renderer) {
	GradientButton($$renderer, {
		outline: true,
		color: 'purpleToBlue',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Purple to Blue`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	GradientButton($$renderer, {
		outline: true,
		color: 'cyanToBlue',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Cyan to Blue`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	GradientButton($$renderer, {
		outline: true,
		color: 'greenToBlue',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Green to Blue`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	GradientButton($$renderer, {
		outline: true,
		color: 'purpleToPink',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Purple to Pink`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	GradientButton($$renderer, {
		outline: true,
		color: 'pinkToOrange',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Pink to Orange`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	GradientButton($$renderer, {
		outline: true,
		color: 'tealToLime',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Teal to Lime`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	GradientButton($$renderer, {
		outline: true,
		pill: true,
		color: 'redToYellow',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Red to Yellow`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	GradientButton($$renderer, {
		outline: true,
		color: 'redToYellow',
		class: 'w-72',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Red to Yellow`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}