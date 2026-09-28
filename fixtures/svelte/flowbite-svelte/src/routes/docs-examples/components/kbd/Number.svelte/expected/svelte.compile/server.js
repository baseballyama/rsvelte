import * as $ from 'svelte/internal/server';
import { Kbd } from "flowbite-svelte";

export default function Number($$renderer) {
	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->1`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->2`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->3`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->4`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->5`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->6`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->7`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->8`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->9`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->0`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}