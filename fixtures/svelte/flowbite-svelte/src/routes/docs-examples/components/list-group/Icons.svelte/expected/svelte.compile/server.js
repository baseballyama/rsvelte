import * as $ from 'svelte/internal/server';
import { Listgroup } from "flowbite-svelte";

import {
	AdjustmentsHorizontalSolid,
	DownloadSolid,
	MessagesSolid,
	UserCircleSolid
} from "flowbite-svelte-icons";

export default function Icons($$renderer) {
	let icons = [
		{ name: "Profile", Icon: UserCircleSolid },
		{ name: "Settings", Icon: AdjustmentsHorizontalSolid },
		{ name: "Messages", Icon: MessagesSolid },
		{ name: "Download", Icon: DownloadSolid }
	];

	Listgroup($$renderer, {
		active: true,
		items: icons,
		class: 'w-48',
		onclick: console.log
	});
}