import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DarkMode } from "flowbite-svelte";
import { ThumbsUpSolid, ThumbsDownSolid } from "flowbite-svelte-icons";

export default function Icon($$anchor) {
	{
		const lightIcon = ($$anchor) => {
			ThumbsUpSolid($$anchor, { color: 'red' });
		};

		const darkIcon = ($$anchor) => {
			ThumbsDownSolid($$anchor, { color: 'green' });
		};

		DarkMode($$anchor, {
			class: 'text-lg',
			lightIcon,
			darkIcon,
			$$slots: { lightIcon: true, darkIcon: true }
		});
	}
}