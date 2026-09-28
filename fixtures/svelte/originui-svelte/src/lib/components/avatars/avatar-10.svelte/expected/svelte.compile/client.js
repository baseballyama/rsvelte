import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Badge from '$lib/components/ui/badge.svelte';
import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="relative"><!> <!></div>`);

export default function Avatar_10($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Avatar(node, {
		class: 'rounded-lg',
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

	var node_3 = $.sibling(node, 2);

	Badge(node_3, {
		class: 'border-background absolute -top-2 left-full min-w-5 -translate-x-3 px-1',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('6');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}