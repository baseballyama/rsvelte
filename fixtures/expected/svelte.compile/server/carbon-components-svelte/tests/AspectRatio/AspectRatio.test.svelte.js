import * as $ from 'svelte/internal/server';
import AspectRatio from "carbon-components-svelte/AspectRatio/AspectRatio.svelte";

export default function AspectRatio_test($$renderer) {
	AspectRatio($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->2x1`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	AspectRatio($$renderer, {
		ratio: '2x3',
		children: ($$renderer) => {
			$$renderer.push(`<!---->2x3`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	AspectRatio($$renderer, {
		ratio: '16x9',
		children: ($$renderer) => {
			$$renderer.push(`<!---->16x9`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	AspectRatio($$renderer, {
		ratio: '4x3',
		children: ($$renderer) => {
			$$renderer.push(`<!---->4x3`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	AspectRatio($$renderer, {
		ratio: '1x1',
		children: ($$renderer) => {
			$$renderer.push(`<!---->1x1`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	AspectRatio($$renderer, {
		ratio: '3x4',
		children: ($$renderer) => {
			$$renderer.push(`<!---->3x4`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	AspectRatio($$renderer, {
		ratio: '3x2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->3x2`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	AspectRatio($$renderer, {
		ratio: '9x16',
		children: ($$renderer) => {
			$$renderer.push(`<!---->9x16`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	AspectRatio($$renderer, {
		ratio: '1x2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->1x2`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}