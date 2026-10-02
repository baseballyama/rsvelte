import * as $ from 'svelte/internal/server';
import { Textarea } from "flowbite-svelte";

export default function Textarea_1($$renderer) {
	let textareaprops = {
		id: "message",
		name: "message",
		label: "Your message",
		rows: 4,
		placeholder: "Leave a comment..."
	};

	Textarea($$renderer, $.spread_props([textareaprops, { class: 'w-full' }]));
}