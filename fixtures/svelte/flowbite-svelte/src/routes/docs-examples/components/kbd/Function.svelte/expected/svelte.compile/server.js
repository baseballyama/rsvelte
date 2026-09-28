import * as $ from 'svelte/internal/server';
import { Kbd } from "flowbite-svelte";

export default function Function($$renderer) {
	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->F1`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->F2`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->F3`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->F4`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->F5`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->F6`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->F7`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->F8`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->F9`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->F10`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->F11`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->F12`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}