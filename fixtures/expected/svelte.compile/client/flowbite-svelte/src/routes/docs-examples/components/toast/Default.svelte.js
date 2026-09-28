import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toast } from "flowbite-svelte";
import { FireOutline } from "flowbite-svelte-icons";

export default function Default($$anchor) {
	{
		const icon = ($$anchor) => {
			FireOutline($$anchor, {
				class: 'text-primary-500 bg-primary-100 dark:bg-primary-800 dark:text-primary-200 h-6 w-6'
			});
		};

		Toast($$anchor, {
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('Set yourself free.');

				$.append($$anchor, text);
			},
			$$slots: { icon: true, default: true }
		});
	}
}