import * as $ from 'svelte/internal/server';
import { Input } from "flowbite-svelte";

export default function Event($$renderer) {
	Input($$renderer, {
		clearable: true,
		clearableOnClick: () => {
			alert("Clicked close button!");
		},
		class: 'my-4'
	});
}