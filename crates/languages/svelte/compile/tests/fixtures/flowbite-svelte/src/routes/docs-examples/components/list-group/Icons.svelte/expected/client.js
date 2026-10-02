import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Listgroup } from "flowbite-svelte";

import {
	AdjustmentsHorizontalSolid,
	DownloadSolid,
	MessagesSolid,
	UserCircleSolid
} from "flowbite-svelte-icons";

export default function Icons($$anchor) {
	let icons = [
		{ name: "Profile", Icon: UserCircleSolid },
		{ name: "Settings", Icon: AdjustmentsHorizontalSolid },
		{ name: "Messages", Icon: MessagesSolid },
		{ name: "Download", Icon: DownloadSolid }
	];

	Listgroup($$anchor, {
		active: true,
		get items() {
			return icons;
		},
		class: 'w-48',
		onclick: console.log
	});
}