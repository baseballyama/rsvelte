import * as $ from 'svelte/internal/server';
import { Button } from "flowbite-svelte";
import { EnvelopeSolid } from "flowbite-svelte-icons";

export default function Sizes($$renderer) {
	Button($$renderer, {
		size: 'xs',
		children: ($$renderer) => {
			EnvelopeSolid($$renderer, { class: 'me-2 h-4 w-4' });
			$$renderer.push(`<!---->Extra small`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		size: 'sm',
		children: ($$renderer) => {
			EnvelopeSolid($$renderer, { class: 'me-2 h-4 w-4' });
			$$renderer.push(`<!---->Small`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		size: 'md',
		children: ($$renderer) => {
			EnvelopeSolid($$renderer, { class: 'me-2 h-5 w-5' });
			$$renderer.push(`<!---->Base`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		size: 'lg',
		children: ($$renderer) => {
			EnvelopeSolid($$renderer, { class: 'me-2 h-5 w-5' });
			$$renderer.push(`<!---->Large`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		size: 'xl',
		children: ($$renderer) => {
			EnvelopeSolid($$renderer, { class: 'me-2 h-6 w-6' });
			$$renderer.push(`<!---->Extra large`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}