import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toolbar, ToolbarButton, Textarea, Button } from "flowbite-svelte";
import { PaperClipOutline, MapPinAltSolid, ImageOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center justify-between"><!> <!></div>`);
var root_2 = $.from_html(`<form class="mb-4"><!></form> <p class="ms-auto text-xs text-gray-500 dark:text-gray-400">Remember, contributions to this topic should follow our <a href="/" class="text-blue-600 hover:underline dark:text-blue-500">Community Guidelines</a> .</p>`, 1);

export default function CommentBox($$anchor) {
	var fragment = root_2();
	var form = $.first_child(fragment);
	var node = $.child(form);

	{
		const footer = ($$anchor) => {
			var div = root_1();
			var node_1 = $.child(div);

			Button(node_1, {
				type: 'submit',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Post comment');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Toolbar(node_2, {
				embedded: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_3 = $.first_child(fragment_1);

					ToolbarButton(node_3, {
						name: 'Attach file',
						children: ($$anchor, $$slotProps) => {
							PaperClipOutline($$anchor, { class: 'h-5 w-5 rotate-45' });
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					ToolbarButton(node_4, {
						name: 'Embed map',
						children: ($$anchor, $$slotProps) => {
							MapPinAltSolid($$anchor, { class: 'h-5 w-5' });
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					ToolbarButton(node_5, {
						name: 'Upload image',
						children: ($$anchor, $$slotProps) => {
							ImageOutline($$anchor, { class: 'h-5 w-5' });
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		Textarea(node, {
			placeholder: 'Write a comment',
			footer,
			$$slots: { footer: true }
		});
	}

	$.reset(form);
	$.next(2);
	$.append($$anchor, fragment);
}