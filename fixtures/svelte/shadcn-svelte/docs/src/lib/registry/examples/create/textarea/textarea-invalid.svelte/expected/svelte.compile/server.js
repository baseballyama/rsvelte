import * as $ from 'svelte/internal/server';
import { Textarea } from "$lib/registry/ui/textarea/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Textarea_invalid($$renderer) {
	Example($$renderer, {
		title: 'Invalid',
		children: ($$renderer) => {
			Textarea($$renderer, {
				placeholder: 'Type your message here.',
				'aria-invalid': 'true'
			});
		},
		$$slots: { default: true }
	});
}