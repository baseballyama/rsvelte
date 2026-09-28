import * as $ from 'svelte/internal/server';
import { Textarea } from "flowbite-svelte";

export default function Disabled($$renderer) {
	Textarea($$renderer, {
		disabled: true,
		id: 'textarea-id',
		placeholder: 'Your message',
		rows: 4,
		name: 'message',
		class: 'w-full'
	});
}