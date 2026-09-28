import * as $ from 'svelte/internal/server';
import { MultiSelect } from "flowbite-svelte";

export default function MultiDisabled($$renderer) {
	let selected = [];

	let countries = [
		{ value: "us", name: "United States" },
		{ value: "ca", name: "Canada" },
		{ value: "fr", name: "France" },
		{ value: "jp", name: "Japan" },
		{ value: "en", name: "England" }
	];

	MultiSelect($$renderer, {
		disabled: true,
		items: countries,
		value: selected,
		size: 'lg'
	});
}