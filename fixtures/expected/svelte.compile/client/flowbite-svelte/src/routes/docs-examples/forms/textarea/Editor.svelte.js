import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Textarea,
	Toolbar,
	ToolbarGroup,
	ToolbarButton,
	Button,
	Label
} from "flowbite-svelte";

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
var root_2 = $.from_html(`<form><!> <!> <!></form>`);

export default function Editor($$anchor) {
	var form = root_2();
	var node = $.child(form);

	Label(node, {
		for: 'editor',
		class: 'sr-only',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Publish post');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	{
		const header = ($$anchor) => {
			{
				const end = ($$anchor) => {
					ToolbarButton($$anchor, {
						name: 'send',
						children: ($$anchor, $$slotProps) => {
							PaperPlaneOutline($$anchor, { class: 'h-6 w-6 rotate-45' });
						},
						$$slots: { default: true }
					});
				};

				Toolbar($$anchor, {
					embedded: true,
					end,
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_1();
						var node_2 = $.first_child(fragment_3);

						ToolbarGroup(node_2, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_3 = $.first_child(fragment_4);

								ToolbarButton(node_3, {
									name: 'Attach file',
									children: ($$anchor, $$slotProps) => {
										PaperClipOutline($$anchor, { class: 'h-6 w-6 rotate-45' });
									},
									$$slots: { default: true }
								});

								var node_4 = $.sibling(node_3, 2);

								ToolbarButton(node_4, {
									name: 'Embed map',
									children: ($$anchor, $$slotProps) => {
										MapPinAltSolid($$anchor, { class: 'h-6 w-6' });
									},
									$$slots: { default: true }
								});

								var node_5 = $.sibling(node_4, 2);

								ToolbarButton(node_5, {
									name: 'Upload image',
									children: ($$anchor, $$slotProps) => {
										ImageOutline($$anchor, { class: 'h-6 w-6' });
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});

						var node_6 = $.sibling(node_2, 2);

						ToolbarGroup(node_6, {
							children: ($$anchor, $$slotProps) => {
								var fragment_8 = root_1();
								var node_7 = $.first_child(fragment_8);

								ToolbarButton(node_7, {
									name: 'Format code',
									children: ($$anchor, $$slotProps) => {
										CodeOutline($$anchor, { class: 'h-6 w-6' });
									},
									$$slots: { default: true }
								});

								var node_8 = $.sibling(node_7, 2);

								ToolbarButton(node_8, {
									name: 'Add emoji',
									children: ($$anchor, $$slotProps) => {
										FaceGrinOutline($$anchor, { class: 'h-6 w-6' });
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

		Textarea(node_1, {
			id: 'editor',
			rows: 8,
			class: 'mb-4',
			placeholder: 'Write a comment',
			header,
			$$slots: { header: true }
		});
	}

	var node_9 = $.sibling(node_1, 2);

	Button(node_9, {
		class: 'mt-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Publish post');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(form);
	$.append($$anchor, form);
}