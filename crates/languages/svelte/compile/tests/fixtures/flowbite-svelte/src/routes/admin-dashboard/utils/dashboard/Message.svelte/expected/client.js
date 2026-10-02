import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Textarea, Toolbar, ToolbarButton } from "flowbite-svelte";
import { ImageSolid, MapPinAltSolid, PaperClipOutline } from "flowbite-svelte-icons";
import { setContext } from "svelte";

var root = $.from_html(`<!> <span class="sr-only">Attach file</span>`, 1);
var root_1 = $.from_html(`<!> <span class="sr-only">Set location</span>`, 1);
var root_2 = $.from_html(`<!> <span class="sr-only">Upload image</span>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="flex items-center justify-between"><!> <!></div>`);
var root_5 = $.from_html(`<form><!></form>`);

export default function Message($$anchor, $$props) {
	$.push($$props, true);
	setContext("background", false);

	var form = root_5();
	var node = $.child(form);

	{
		const footer = ($$anchor) => {
			var div = root_4();
			var node_1 = $.child(div);

			Button(node_1, {
				type: 'submit',
				size: 'xs',
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
				class: 'text-gray-500 dark:text-gray-300',
				children: ($$anchor, $$slotProps) => {
					var fragment = root_3();
					var node_3 = $.first_child(fragment);

					ToolbarButton(node_3, {
						class: 'p-2 hover:text-gray-900 dark:hover:text-white',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_4 = $.first_child(fragment_1);

							PaperClipOutline(node_4, { size: 'md' });
							$.next(2);
							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_3, 2);

					ToolbarButton(node_5, {
						class: 'p-2 hover:text-gray-900 dark:hover:text-white',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_6 = $.first_child(fragment_2);

							MapPinAltSolid(node_6, { size: 'md' });
							$.next(2);
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_5, 2);

					ToolbarButton(node_7, {
						class: 'p-2 hover:text-gray-900 dark:hover:text-white',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_2();
							var node_8 = $.first_child(fragment_3);

							ImageSolid(node_8, { size: 'md' });
							$.next(2);
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		Textarea(node, {
			rows: 8,
			placeholder: 'Write your message',
			required: true,
			footer,
			$$slots: { footer: true }
		});
	}

	$.reset(form);
	$.append($$anchor, form);
	$.pop();
}