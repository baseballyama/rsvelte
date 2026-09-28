import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Textarea } from "flowbite-svelte";

export default function Textarea_1($$anchor) {
	let textareaprops = {
		id: "message",
		name: "message",
		label: "Your message",
		rows: 4,
		placeholder: "Leave a comment..."
	};

	Textarea($$anchor, $.spread_props(() => textareaprops, { class: 'w-full' }));
}