import * as $ from 'svelte/internal/server';
import { GradientButton } from "flowbite-svelte";

export default function Duotone($$renderer) {
	GradientButton($$renderer, {
		color: 'purpleToBlue',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Purple to Blue`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	GradientButton($$renderer, {
		color: 'cyanToBlue',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Cyan to Blue`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	GradientButton($$renderer, {
		color: 'greenToBlue',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Green to Blue`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	GradientButton($$renderer, {
		color: 'purpleToPink',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Purple to Pink`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	GradientButton($$renderer, {
		color: 'pinkToOrange',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Pink to Orange`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	GradientButton($$renderer, {
		color: 'tealToLime',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Teal to Lime`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	GradientButton($$renderer, {
		color: 'redToYellow',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Red to Yellow`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}