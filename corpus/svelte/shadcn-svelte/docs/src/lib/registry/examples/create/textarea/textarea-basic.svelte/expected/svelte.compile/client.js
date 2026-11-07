import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Textarea } from "$lib/registry/ui/textarea/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Textarea_basic($$anchor) {
	Example($$anchor, {
		title: 'Basic',
		children: ($$anchor, $$slotProps) => {
			Textarea($$anchor, { placeholder: 'Type your message here.' });
		},
		$$slots: { default: true }
	});
}