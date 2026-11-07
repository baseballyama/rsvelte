import * as $ from 'svelte/internal/server';
import { Kbd } from "flowbite-svelte";

import {
	CaretUpSolid,
	CaretDownSolid,
	CaretRightSolid,
	CaretLeftSolid
} from "flowbite-svelte-icons";

export default function Arrow($$renderer) {
	Kbd($$renderer, {
		class: 'me-1 inline-flex items-center px-2 py-1.5',
		children: ($$renderer) => {
			CaretUpSolid($$renderer, {});
			$$renderer.push(`<!----> <span class="sr-only">Arrow key up</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		class: 'me-1 inline-flex items-center px-2 py-1.5',
		children: ($$renderer) => {
			CaretDownSolid($$renderer, {});
			$$renderer.push(`<!----> <span class="sr-only">Arrow key down</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		class: 'me-1 inline-flex items-center px-2 py-1.5',
		children: ($$renderer) => {
			CaretLeftSolid($$renderer, {});
			$$renderer.push(`<!----> <span class="sr-only">Arrow key left</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Kbd($$renderer, {
		class: 'me-1 inline-flex items-center px-2 py-1.5',
		children: ($$renderer) => {
			CaretRightSolid($$renderer, {});
			$$renderer.push(`<!----> <span class="sr-only">Arrow key right</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}