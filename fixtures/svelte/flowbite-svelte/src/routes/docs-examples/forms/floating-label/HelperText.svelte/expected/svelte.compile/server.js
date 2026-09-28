import * as $ from 'svelte/internal/server';
import { FloatingLabelInput, Helper } from "flowbite-svelte";

export default function HelperText($$renderer) {
	FloatingLabelInput($$renderer, {
		variant: 'filled',
		id: 'floating_helper',
		'aria-describedby': 'floating_helper_text',
		name: 'floating_helper',
		type: 'text',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Floating helper`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Helper($$renderer, {
		class: 'pt-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Remember, contributions to this topic should follow our <a href="/" class="text-primary-600 dark:text-primary-500 hover:underline">Community Guidelines</a> .`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}