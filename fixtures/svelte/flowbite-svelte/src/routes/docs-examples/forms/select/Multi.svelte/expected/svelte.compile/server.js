import * as $ from 'svelte/internal/server';
import { MultiSelect } from "flowbite-svelte";

export default function Multi($$renderer) {
	let multiSelected = [];

	let countries = [
		{ value: "us", name: "United States" },
		{ value: "ca", name: "Canada" },
		{ value: "fr", name: "France" },
		{ value: "jp", name: "Japan" },
		{ value: "en", name: "England" }
	];

	MultiSelect($$renderer, { items: countries, value: multiSelected, size: 'lg' });
}