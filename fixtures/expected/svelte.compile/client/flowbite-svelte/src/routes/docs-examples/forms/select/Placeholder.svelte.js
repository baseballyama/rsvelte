import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MultiSelect } from "flowbite-svelte";

export default function Placeholder($$anchor) {
	let placeholder = "placeholder text";
	let selected = [];

	let countries = [
		{ value: "us", name: "United States" },
		{ value: "ca", name: "Canada" },
		{ value: "fr", name: "France" },
		{ value: "jp", name: "Japan" },
		{ value: "en", name: "England" }
	];

	MultiSelect($$anchor, {
		get items() {
			return countries;
		},

		get value() {
			return selected;
		},
		size: 'lg',
		placeholder
	});
}