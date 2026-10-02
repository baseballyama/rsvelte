import * as $ from 'svelte/internal/server';
import { Textarea, Toolbar, ToolbarGroup, ToolbarButton, Button } from "flowbite-svelte";

import {
	PaperClipOutline,
	MapPinAltSolid,
	ImageOutline,
	CodeOutline,
	FaceGrinOutline,
	PaperPlaneOutline
} from "flowbite-svelte-icons";

export default function Editor($$renderer) {
	$$renderer.push(`<form><label for="editor" class="sr-only">Publish post</label> `);

	{
		function header($$renderer) {
			{
				function end($$renderer) {
					ToolbarButton($$renderer, {
						name: 'send',
						children: ($$renderer) => {
							PaperPlaneOutline($$renderer, { class: 'h-5 w-5 rotate-45' });
						},
						$$slots: { default: true }
					});
				}

				Toolbar($$renderer, {
					embedded: true,
					end,
					children: ($$renderer) => {
						ToolbarGroup($$renderer, {
							children: ($$renderer) => {
								ToolbarButton($$renderer, {
									name: 'Attach file',
									children: ($$renderer) => {
										PaperClipOutline($$renderer, { class: 'h-5 w-5 rotate-45' });
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								ToolbarButton($$renderer, {
									name: 'Embed map',
									children: ($$renderer) => {
										MapPinAltSolid($$renderer, { class: 'h-5 w-5' });
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								ToolbarButton($$renderer, {
									name: 'Upload image',
									children: ($$renderer) => {
										ImageOutline($$renderer, { class: 'h-5 w-5' });
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToolbarGroup($$renderer, {
							children: ($$renderer) => {
								ToolbarButton($$renderer, {
									name: 'Format code',
									children: ($$renderer) => {
										CodeOutline($$renderer, { class: 'h-5 w-5' });
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								ToolbarButton($$renderer, {
									name: 'Add emoji',
									children: ($$renderer) => {
										FaceGrinOutline($$renderer, { class: 'h-5 w-5' });
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { end: true, default: true }
				});
			}
		}

		Textarea($$renderer, {
			id: 'editor',
			rows: 8,
			class: 'mb-4',
			placeholder: 'Write a comment',
			header,
			$$slots: { header: true }
		});
	}

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Publish post`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></form>`);
}