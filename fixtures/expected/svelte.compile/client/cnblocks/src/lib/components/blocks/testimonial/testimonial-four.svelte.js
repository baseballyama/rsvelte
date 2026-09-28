import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar, AvatarImage, AvatarFallback } from "$lib/components/ui/avatar";

var root = $.from_html(`<!> <!>`, 1);

var root_1 = $.from_html(`<section class="py-16 md:py-32"><div class="mx-auto max-w-5xl px-6"><div class="mx-auto max-w-2xl text-center"><blockquote><p class="text-lg font-medium sm:text-xl md:text-3xl">Using TailsUI has been like unlocking a secret design superpower. It's the
					perfect fusion of simplicity and versatility, enabling us to create UIs that are
					as stunning as they are user-friendly.</p> <div class="mt-12 flex items-center justify-center gap-6"><!> <div class="space-y-1 border-l pl-6"><cite class="font-medium">John Doe</cite> <span class="block text-sm text-muted-foreground">CEO, Nvidia</span></div></div></blockquote></div></div></section>`);

export default function Testimonial_four($$anchor) {
	var section = root_1();
	var div = $.child(section);
	var div_1 = $.child(div);
	var blockquote = $.child(div_1);
	var div_2 = $.sibling($.child(blockquote), 2);
	var node = $.child(div_2);

	Avatar(node, {
		class: 'size-12',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			AvatarImage(node_1, {
				src: 'https://tailus.io/images/reviews/shekinah.webp',
				alt: 'Shekinah Tshiokufila',
				height: '400',
				width: '400',
				loading: 'lazy'
			});

			var node_2 = $.sibling(node_1, 2);

			AvatarFallback(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('ST');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div_2);
	$.reset(blockquote);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}