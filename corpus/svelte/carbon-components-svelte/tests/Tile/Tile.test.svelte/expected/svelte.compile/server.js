import * as $ from 'svelte/internal/server';
import Tile from "carbon-components-svelte/Tile/Tile.svelte";

export default function Tile_test($$renderer) {
	Tile($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default tile`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tile($$renderer, {
		light: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Light variant`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tile($$renderer, {
		'data-testid': 'click-test',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Clickable tile`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tile($$renderer, {
		'data-testid': 'attr-test',
		title: 'Custom title',
		class: 'custom-class',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Custom attributes`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}