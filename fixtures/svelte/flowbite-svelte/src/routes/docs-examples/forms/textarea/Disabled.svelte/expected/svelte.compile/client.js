import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Textarea } from "flowbite-svelte";

export default function Disabled($$anchor) {
	Textarea($$anchor, {
		disabled: true,
		id: 'textarea-id',
		placeholder: 'Your message',
		rows: 4,
		name: 'message',
		class: 'w-full'
	});
}