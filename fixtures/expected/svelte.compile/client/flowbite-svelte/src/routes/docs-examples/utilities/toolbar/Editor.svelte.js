import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Textarea, Toolbar, ToolbarGroup, ToolbarButton, Button } from "flowbite-svelte";

import {
	PaperClipOutline,
	MapPinAltSolid,
	ImageOutline,
	CodeOutline,
	FaceGrinOutline,
	PaperPlaneOutline
} from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<form><label for="editor" class="sr-only">Publish post</label> <!> <!></form>`);

export default function Editor($$anchor) {
	var form = root_2();
	var node = $.sibling($.child(form), 2);

	{
		const header = ($$anchor) => {
			{
				const end = ($$anchor) => {
					ToolbarButton($$anchor, {
						name: 'send',
						children: ($$anchor, $$slotProps) => {
							PaperPlaneOutline($$anchor, { class: 'h-5 w-5 rotate-45' });
						},
						$$slots: { default: true }
					});
				};

				Toolbar($$anchor, {
					embedded: true,
					end,
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_1();
						var node_1 = $.first_child(fragment_3);

						ToolbarGroup(node_1, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_2 = $.first_child(fragment_4);

								ToolbarButton(node_2, {
									name: 'Attach file',
									children: ($$anchor, $$slotProps) => {
										PaperClipOutline($$anchor, { class: 'h-5 w-5 rotate-45' });
									},
									$$slots: { default: true }
								});

								var node_3 = $.sibling(node_2, 2);

								ToolbarButton(node_3, {
									name: 'Embed map',
									children: ($$anchor, $$slotProps) => {
										MapPinAltSolid($$anchor, { class: 'h-5 w-5' });
									},
									$$slots: { default: true }
								});

								var node_4 = $.sibling(node_3, 2);

								ToolbarButton(node_4, {
									name: 'Upload image',
									children: ($$anchor, $$slotProps) => {
										ImageOutline($$anchor, { class: 'h-5 w-5' });
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});

						var node_5 = $.sibling(node_1, 2);

						ToolbarGroup(node_5, {
							children: ($$anchor, $$slotProps) => {
								var fragment_8 = root_1();
								var node_6 = $.first_child(fragment_8);

								ToolbarButton(node_6, {
									name: 'Format code',
									children: ($$anchor, $$slotProps) => {
										CodeOutline($$anchor, { class: 'h-5 w-5' });
									},
									$$slots: { default: true }
								});

								var node_7 = $.sibling(node_6, 2);

								ToolbarButton(node_7, {
									name: 'Add emoji',
									children: ($$anchor, $$slotProps) => {
										FaceGrinOutline($$anchor, { class: 'h-5 w-5' });
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_8);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { end: true, default: true }
				});
			}
		};

		Textarea(node, {
			id: 'editor',
			rows: 8,
			class: 'mb-4',
			placeholder: 'Write a comment',
			header,
			$$slots: { header: true }
		});
	}

	var node_8 = $.sibling(node, 2);

	Button(node_8, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Publish post');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(form);
	$.append($$anchor, form);
}