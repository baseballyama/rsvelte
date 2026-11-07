import * as $ from 'svelte/internal/server';
import { PhoneInput } from "flowbite-svelte";

export default function Classes($$renderer) {
	PhoneInput($$renderer, {
		'aria-describedby': 'helper-text-explanation',
		id: 'phone-input',
		placeholder: '123-456-7890',
		required: true,
		classes: { input: "border-blue-500", div: "ps-4" }
	});
}