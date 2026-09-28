import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toast } from "flowbite-svelte";
import { PaperPlaneOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<div class="ps-4 text-sm font-normal">Message sent successfully.</div>`);

export default function Simple($$anchor) {
	{
		const icon = ($$anchor) => {
			PaperPlaneOutline($$anchor, {
				class: 'text-primary-600 dark:text-primary-500 h-5 w-5 rotate-45'
			});
		};

		Toast($$anchor, {
			dismissable: false,
			icon,
			children: ($$anchor, $$slotProps) => {
				var div = root();

				$.append($$anchor, div);
			},
			$$slots: { icon: true, default: true }
		});
	}
}