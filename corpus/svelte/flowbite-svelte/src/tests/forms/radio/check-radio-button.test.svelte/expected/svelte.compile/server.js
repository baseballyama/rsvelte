import * as $ from 'svelte/internal/server';
import { RadioButton } from "$lib";

export default function Check_radio_button_test($$renderer) {
	RadioButton($$renderer, {
		name: 'test',
		value: 'A',
		children: ($$renderer) => {
			$$renderer.push(`<!---->A`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	RadioButton($$renderer, {
		name: 'test',
		value: 'B',
		children: ($$renderer) => {
			$$renderer.push(`<!---->B`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}