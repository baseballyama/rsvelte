import * as $ from 'svelte/internal/server';
import { Fileupload } from "flowbite-svelte";

export default function ElementRef($$renderer) {
	Fileupload($$renderer, {
		id: 'event',
		clearable: true,
		clearableOnClick: () => {
			alert("Clicked close button!");
		}
	});
}