import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MultiSelect } from "flowbite-svelte";

export default function MultiOption($$anchor) {
	let selected = [];

	let countries = [
		{ value: "us", name: "United States" },
		{ value: "ca", name: "Canada" },
		{ value: "fr", name: "France" },
		{ value: "jp", name: "Japan", disabled: true },
		{ value: "en", name: "England", disabled: true }
	];

	MultiSelect($$anchor, {
		get items() {
			return countries;
		},

		get value() {
			return selected;
		},
		size: 'lg'
	});
}