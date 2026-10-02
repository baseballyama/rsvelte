import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar, AvatarFallback, AvatarImage } from "$lib/components/ui/avatar";
import Quote from "@lucide/svelte/icons/quote";

var root = $.from_html(`<!> <!>`, 1);

var root_1 = $.from_html(`<section><div class="bg-muted py-24"><div class="mx-auto w-full max-w-2xl px-6 text-center"><div class="max-w-xl"><!> <blockquote class="mt-6"><p class="text-xl text-foreground">Using Tailark has been like unlocking a secret design superpower. It's the
						perfect fusion of simplicity and versatility, enabling us to create UIs that
						are as stunning as they are user-friendly.</p> <footer class="mt-6 flex flex-col items-center justify-center"><!> <cite class="mt-2 text-lg font-medium text-foreground">Théo Balick</cite> <span class="text-muted-foreground">@theo_b</span></footer></blockquote></div></div></div></section>`);

export default function Five($$anchor) {
	var section = root_1();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Quote(node, {
		class: 'mx-auto size-8 fill-background stroke-background drop-shadow-sm'
	});

	var blockquote = $.sibling(node, 2);
	var footer = $.sibling($.child(blockquote), 2);
	var node_1 = $.child(footer);

	Avatar(node_1, {
		class: ' size-12 border border-transparent shadow ring-1',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			AvatarImage(node_2, {
				src: 'https://avatars.githubusercontent.com/u/68236786?v=4',
				alt: 'Théo Balick'
			});

			var node_3 = $.sibling(node_2, 2);

			AvatarFallback(node_3, {
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

	$.next(4);
	$.reset(footer);
	$.reset(blockquote);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}