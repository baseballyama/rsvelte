import * as $ from 'svelte/internal/server';
import { Toolbar, ToolbarButton, Textarea, Button } from "flowbite-svelte";
import { PaperClipOutline, MapPinAltSolid, ImageOutline } from "flowbite-svelte-icons";

export default function CommentBox($$renderer) {
	$$renderer.push(`<form class="mb-4">`);

	{
		function footer($$renderer) {
			$$renderer.push(`<div class="flex items-center justify-between">`);

			Button($$renderer, {
				type: 'submit',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Post comment`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Toolbar($$renderer, {
				embedded: true,
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

			$$renderer.push(`<!----></div>`);
		}

		Textarea($$renderer, {
			placeholder: 'Write a comment',
			footer,
			$$slots: { footer: true }
		});
	}

	$$renderer.push(`<!----></form> <p class="ms-auto text-xs text-gray-500 dark:text-gray-400">Remember, contributions to this topic should follow our <a href="/" class="text-blue-600 hover:underline dark:text-blue-500">Community Guidelines</a> .</p>`);
}