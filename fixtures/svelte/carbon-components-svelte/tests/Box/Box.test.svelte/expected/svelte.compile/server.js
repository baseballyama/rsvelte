import * as $ from 'svelte/internal/server';
import Box from "carbon-components-svelte/Box/Box.svelte";

export default function Box_test($$renderer) {
	Box($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default box`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Box($$renderer, {
		tag: 'section',
		fill: 'layer-01',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Layer fill`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Box($$renderer, {
		fill: 'background',
		border: 'subtle',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Fill and border`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Box($$renderer, {
		padding: 5,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Padding scale`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Box($$renderer, {
		padding: '1.5rem',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Custom padding`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Box($$renderer, {
		paddingX: 3,
		paddingY: 5,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Axis padding`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Box($$renderer, {
		margin: 4,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Margin scale`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Box($$renderer, {
		fullWidth: true,
		maxWidth: 480,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Full width capped`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Box($$renderer, {
		width: '12rem',
		minWidth: '8rem',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Custom width`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Box($$renderer, {
		fill: 'layer-02',
		padding: 6,
		border: 'subtle',
		class: 'combined',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Combined modifiers`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}