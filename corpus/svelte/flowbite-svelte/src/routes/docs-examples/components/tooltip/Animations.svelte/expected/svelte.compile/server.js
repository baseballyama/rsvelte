import * as $ from 'svelte/internal/server';
import { Tooltip, Button } from "flowbite-svelte";
import { slide, scale, blur } from "svelte/transition";

export default function Animations($$renderer) {
	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Blur`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		transition: blur,
		transitionParams: { duration: 300 },
		children: ($$renderer) => {
			$$renderer.push(`<!---->Tooltip content`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Slide`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		transition: slide,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Tooltip content`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Scale`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		transition: scale,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Tooltip content`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}