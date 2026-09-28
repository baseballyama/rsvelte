import * as $ from 'svelte/internal/server';
import { Popover, Button } from "flowbite-svelte";
import { blur, fade, slide } from "svelte/transition";

export default function Animation($$renderer) {
	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Fade popover`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Popover($$renderer, {
		class: 'w-64 text-sm font-light',
		title: 'Popover title',
		transition: fade,
		transitionParams: { duration: 1000 },
		children: ($$renderer) => {
			$$renderer.push(`<!---->And here's some amazing content. It's very engaging. Right?`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Blur popover`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Popover($$renderer, {
		class: 'w-64 text-sm font-light',
		title: 'Popover title',
		transition: blur,
		transitionParams: { duration: 1000 },
		children: ($$renderer) => {
			$$renderer.push(`<!---->And here's some amazing content. It's very engaging. Right?`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Slide popover`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Popover($$renderer, {
		class: 'w-64 text-sm font-light',
		title: 'Popover title',
		transition: slide,
		children: ($$renderer) => {
			$$renderer.push(`<!---->And here's some amazing content. It's very engaging. Right?`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}