import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Search } from "flowbite-svelte";

export default function Event($$anchor) {
	Search($$anchor, {
		clearable: true,
		clearableOnClick: () => {
			alert("Clicked clear button!");
		}
	});
}