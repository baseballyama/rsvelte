import * as $ from 'svelte/internal/server';
import { Kbd } from "flowbite-svelte";

export default function Default($$renderer) {
	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Shift`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Ctrl`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Tab`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Caps Lock`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Esc`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		class: 'px-4',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Spacebar`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Enter`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}