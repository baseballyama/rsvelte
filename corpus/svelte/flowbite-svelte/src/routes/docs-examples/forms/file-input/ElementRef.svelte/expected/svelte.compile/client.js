import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Fileupload } from "flowbite-svelte";

export default function ElementRef($$anchor) {
	Fileupload($$anchor, {
		id: 'event',
		clearable: true,
		clearableOnClick: () => {
			alert("Clicked close button!");
		}
	});
}