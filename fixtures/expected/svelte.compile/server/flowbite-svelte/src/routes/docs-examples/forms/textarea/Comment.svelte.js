import * as $ from 'svelte/internal/server';
import { Textarea, Toolbar, ToolbarButton, Button } from "flowbite-svelte";
import { PaperClipOutline, MapPinAltSolid, ImageOutline } from "flowbite-svelte-icons";

export default function Comment($$renderer) {
	$$renderer.push(`<form>`);

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
							PaperClipOutline($$renderer, { class: 'h-6 w-6' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ToolbarButton($$renderer, {
						name: 'Set location',
						children: ($$renderer) => {
							MapPinAltSolid($$renderer, { class: 'h-6 w-6' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ToolbarButton($$renderer, {
						name: 'Upload image',
						children: ($$renderer) => {
							ImageOutline($$renderer, { class: 'h-6 w-6' });
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
			class: 'mb-4',
			placeholder: 'Write a comment',
			footer,
			$$slots: { footer: true }
		});
	}

	$$renderer.push(`<!----></form> <p class="ms-auto text-xs text-gray-500 dark:text-gray-400">Remember, contributions to this topic should follow our <a href="/" class="text-primary-600 dark:text-primary-500 hover:underline">Community Guidelines</a> .</p>`);
}