import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from "flowbite-svelte";

export default function Event($$anchor) {
	Input($$anchor, {
		clearable: true,
		clearableOnClick: () => {
			alert("Clicked close button!");
		},
		class: 'my-4'
	});
}