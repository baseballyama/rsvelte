import * as $ from 'svelte/internal/server';
import { MultiSelect } from "flowbite-svelte";

export default function MultiOption($$renderer) {
	let selected = [];

	let countries = [
		{ value: "us", name: "United States" },
		{ value: "ca", name: "Canada" },
		{ value: "fr", name: "France" },
		{ value: "jp", name: "Japan", disabled: true },
		{ value: "en", name: "England", disabled: true }
	];

	MultiSelect($$renderer, { items: countries, value: selected, size: 'lg' });
}