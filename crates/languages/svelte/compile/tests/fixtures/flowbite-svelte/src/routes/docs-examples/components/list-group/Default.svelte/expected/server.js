import * as $ from 'svelte/internal/server';
import { Listgroup } from "flowbite-svelte";

export default function Default($$renderer) {
	let simpleList = ["Profile", "Settings", "Messages", "Download"];

	Listgroup($$renderer, { items: simpleList, class: 'w-48' });
}