import * as $ from 'svelte/internal/server';
import { DarkMode } from "flowbite-svelte";
import { ThumbsUpSolid, ThumbsDownSolid } from "flowbite-svelte-icons";

export default function Icon($$renderer) {
	{
		function lightIcon($$renderer) {
			ThumbsUpSolid($$renderer, { color: 'red' });
		}

		function darkIcon($$renderer) {
			ThumbsDownSolid($$renderer, { color: 'green' });
		}

		DarkMode($$renderer, {
			class: 'text-lg',
			lightIcon,
			darkIcon,
			$$slots: { lightIcon: true, darkIcon: true }
		});
	}
}