import * as $ from 'svelte/internal/server';
import { Listgroup } from "flowbite-svelte";

export default function Buttons($$renderer) {
	let buttons = [
		{ name: "Profile", mycustomfield: "data1", current: true },
		{ name: "Settings", mycustomfield: "data2" },
		{ name: "Messages", mycustomfield: "data3" },
		{
			name: "Download",
			mycustomfield: "data4",
			disabled: true,
			attrs: { type: "submit" }
		}
	];

	Listgroup($$renderer, {
		active: true,
		items: buttons,
		class: 'w-48',
		onclick: (e) => alert(Object.entries(e?.detail ?? {}))
	});
}