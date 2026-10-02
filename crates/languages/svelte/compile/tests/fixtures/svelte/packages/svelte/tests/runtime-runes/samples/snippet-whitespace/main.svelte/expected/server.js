import * as $ from 'svelte/internal/server';
import Pre from "./pre.svelte";

function snip($$renderer) {
	$$renderer.push(`<!---->C`);
}

export default function Main($$renderer) {
	$$renderer.push(`<!---->A B `);
	snip($$renderer);
	$$renderer.push(`<!----> D `);

	Pre($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Testing
123          ;
    456`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}