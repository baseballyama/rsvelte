import * as $ from 'svelte/internal/server';
import { Text } from "carbon-components-svelte";

export default function ComponentTocLabel($$renderer) {
	Text($$renderer, {
		tag: 'h5',
		type: 'label-01',
		color: 'primary',
		class: 'toc-section-label',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Examples`);
		},
		$$slots: { default: true }
	});
}