import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toast, Button } from "flowbite-svelte";
import { CameraPhotoOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<span class="font-semibold text-gray-900 dark:text-white">Update available</span> <div class="mt-3"><div class="mb-2 text-sm font-normal">A new software version is available for download.</div> <div class="grid grid-cols-2 gap-2"><!> <!></div></div>`, 1);

export default function Interactive($$anchor) {
	{
		const icon = ($$anchor) => {
			CameraPhotoOutline($$anchor, { class: 'h-6 w-6' });
		};

		Toast($$anchor, {
			align: false,
			icon,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var div = $.sibling($.first_child(fragment_2), 2);
				var div_1 = $.sibling($.child(div), 2);
				var node = $.child(div_1);

				Button(node, {
					size: 'xs',
					class: 'w-full',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Update');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_1 = $.sibling(node, 2);

				Button(node_1, {
					size: 'xs',
					class: 'w-full',
					color: 'dark',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Not now');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				$.reset(div_1);
				$.reset(div);
				$.append($$anchor, fragment_2);
			},
			$$slots: { icon: true, default: true }
		});
	}
}