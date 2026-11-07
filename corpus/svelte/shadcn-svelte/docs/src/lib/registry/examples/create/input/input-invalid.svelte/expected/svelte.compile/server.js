import * as $ from 'svelte/internal/server';
import * as Input from "$lib/registry/ui/input/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Input_invalid($$renderer) {
	Example($$renderer, {
		title: 'Invalid',
		children: ($$renderer) => {
			if (Input.Root) {
				$$renderer.push('<!--[-->');
				Input.Root($$renderer, { type: 'text', placeholder: 'Error', 'aria-invalid': 'true' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}