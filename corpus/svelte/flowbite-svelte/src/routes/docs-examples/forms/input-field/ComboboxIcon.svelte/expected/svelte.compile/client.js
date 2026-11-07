import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from "flowbite-svelte";
import { EnvelopeSolid } from "flowbite-svelte-icons";

export default function ComboboxIcon($$anchor) {
	const fakeEmails = [
		"alex.jones@example.com",
		"maria.smith@example.com",
		"john.doe@example.com",
		"emma.wilson@example.com",
		"liam.brown@example.com",
		"olivia.johnson@example.com",
		"noah.miller@example.com",
		"ava.davis@example.com",
		"elijah.garcia@example.com",
		"sophia.martinez@example.com"
	];

	{
		const left = ($$anchor) => {
			EnvelopeSolid($$anchor, { class: 'h-5 w-5' });
		};

		Input($$anchor, {
			get data() {
				return fakeEmails;
			},
			placeholder: 'name@flowbite.com',
			clearable: true,
			type: 'email',
			size: 'md',
			class: 'ps-9',
			left,
			$$slots: { left: true }
		});
	}
}