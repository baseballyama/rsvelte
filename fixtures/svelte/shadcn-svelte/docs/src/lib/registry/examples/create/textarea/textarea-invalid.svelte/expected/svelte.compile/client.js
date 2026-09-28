import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Textarea } from "$lib/registry/ui/textarea/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Textarea_invalid($$anchor) {
	Example($$anchor, {
		title: 'Invalid',
		children: ($$anchor, $$slotProps) => {
			Textarea($$anchor, {
				placeholder: 'Type your message here.',
				'aria-invalid': 'true'
			});
		},
		$$slots: { default: true }
	});
}