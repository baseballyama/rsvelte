import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="relative"><!> <span class="border-background absolute -end-0.5 -bottom-0.5 size-3 rounded-full border-2 bg-emerald-500"><span class="sr-only">Online</span></span></div>`);

export default function Avatar_05($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Avatar(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			AvatarImage(node_1, { src: '/avatar-80-07.jpg', alt: 'Kelly King' });

			var node_2 = $.sibling(node_1, 2);

			AvatarFallback(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('KK');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
}