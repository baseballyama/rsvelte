import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PhoneInput } from "flowbite-svelte";

export default function Classes($$anchor) {
	PhoneInput($$anchor, {
		'aria-describedby': 'helper-text-explanation',
		id: 'phone-input',
		placeholder: '123-456-7890',
		required: true,
		classes: { input: "border-blue-500", div: "ps-4" }
	});
}