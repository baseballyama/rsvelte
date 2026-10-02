import * as $ from 'svelte/internal/server';
import { Search } from "flowbite-svelte";

export default function Event($$renderer) {
	Search($$renderer, {
		clearable: true,
		clearableOnClick: () => {
			alert("Clicked clear button!");
		}
	});
}