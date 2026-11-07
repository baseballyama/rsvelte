import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar, AvatarFallback, AvatarImage } from "$lib/components/ui/avatar";

var root = $.from_html(`<!> <!>`, 1);

var root_1 = $.from_html(`<section class="[--color-primary:var(--color-indigo-500)]"><div class="py-24"><div class="mx-auto w-full max-w-5xl px-6"><blockquote class="relative max-w-xl pl-6 before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-full before:bg-primary"><p class="text-lg text-foreground">Using Tailark has been like unlocking a secret design superpower. It's the
					perfect fusion of simplicity and versatility, enabling us to create UIs that are
					as stunning as they are user-friendly.</p> <footer class="mt-4 flex items-center gap-2"><!> <cite>Théo Balick</cite> <span aria-hidden="true" class="size-1 rounded-full bg-foreground/15"></span> <span class="text-muted-foreground">Product Designer</span></footer></blockquote></div></div></section>`);

export default function Four($$anchor) {
	var section = root_1();
	var div = $.child(section);
	var div_1 = $.child(div);
	var blockquote = $.child(div_1);
	var footer = $.sibling($.child(blockquote), 2);
	var node = $.child(footer);

	Avatar(node, {
		class: ' size-6 border border-transparent shadow ring-1',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			AvatarImage(node_1, {
				src: 'https://avatars.githubusercontent.com/u/68236786?v=4',
				alt: 'Théo Balick'
			});

			var node_2 = $.sibling(node_1, 2);

			AvatarFallback(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('T');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.next(6);
	$.reset(footer);
	$.reset(blockquote);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}