import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toast, Avatar, Button } from "flowbite-svelte";

var root = $.from_html(`<div class="ms-3 text-sm font-normal"><span class="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Jese Leos</span> <div class="mb-2 text-sm font-normal">Hi Neil, thanks for sharing your thoughts regarding Flowbite.</div> <!></div>`);

export default function Toast_1($$anchor) {
	{
		const icon = ($$anchor) => {
			Avatar($$anchor, { src: '/images/profile-picture-1.webp', class: 'h-8' });
		};

		Toast($$anchor, {
			align: false,
			color: undefined,
			icon,
			children: ($$anchor, $$slotProps) => {
				var div = root();
				var node = $.sibling($.child(div), 4);

				Button(node, {
					size: 'xs',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Reply');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				$.reset(div);
				$.append($$anchor, div);
			},
			$$slots: { icon: true, default: true }
		});
	}
}