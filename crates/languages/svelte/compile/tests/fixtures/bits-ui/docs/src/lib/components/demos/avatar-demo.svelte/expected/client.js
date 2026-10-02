import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar } from "bits-ui";

var root = $.from_html(`<div class="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-transparent"><!> <!></div>`);

export default function Avatar_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Avatar.Root, ($$anchor, Avatar_Root) => {
		Avatar_Root($$anchor, {
			delayMs: 200,
			class: 'data-[status=loaded]:border-foreground bg-muted text-muted-foreground h-12 w-12 rounded-full border text-[17px] font-medium uppercase data-[status=loading]:border-transparent',
			children: ($$anchor, $$slotProps) => {
				var div = root();
				var node_1 = $.child(div);

				$.component(node_1, () => Avatar.Image, ($$anchor, Avatar_Image) => {
					Avatar_Image($$anchor, { src: '/avatar-1.png', alt: '@huntabyte' });
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
					Avatar_Fallback($$anchor, {
						class: 'border-muted border',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('HB');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div);
				$.append($$anchor, div);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}