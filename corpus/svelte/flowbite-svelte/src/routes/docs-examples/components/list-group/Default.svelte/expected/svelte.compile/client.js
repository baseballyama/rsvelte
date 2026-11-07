import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Listgroup } from "flowbite-svelte";

export default function Default($$anchor) {
	let simpleList = ["Profile", "Settings", "Messages", "Download"];

	Listgroup($$anchor, {
		get items() {
			return simpleList;
		},
		class: 'w-48'
	});
}