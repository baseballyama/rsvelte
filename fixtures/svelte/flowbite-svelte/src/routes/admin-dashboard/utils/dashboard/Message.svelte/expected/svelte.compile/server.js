import * as $ from 'svelte/internal/server';
import { Button, Textarea, Toolbar, ToolbarButton } from "flowbite-svelte";
import { ImageSolid, MapPinAltSolid, PaperClipOutline } from "flowbite-svelte-icons";
import { setContext } from "svelte";

export default function Message($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		setContext("background", false);
		$$renderer.push(`<form>`);

		{
			function footer($$renderer) {
				$$renderer.push(`<div class="flex items-center justify-between">`);

				Button($$renderer, {
					type: 'submit',
					size: 'xs',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Post comment`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Toolbar($$renderer, {
					embedded: true,
					class: 'text-gray-500 dark:text-gray-300',
					children: ($$renderer) => {
						ToolbarButton($$renderer, {
							class: 'p-2 hover:text-gray-900 dark:hover:text-white',
							children: ($$renderer) => {
								PaperClipOutline($$renderer, { size: 'md' });
								$$renderer.push(`<!----> <span class="sr-only">Attach file</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToolbarButton($$renderer, {
							class: 'p-2 hover:text-gray-900 dark:hover:text-white',
							children: ($$renderer) => {
								MapPinAltSolid($$renderer, { size: 'md' });
								$$renderer.push(`<!----> <span class="sr-only">Set location</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToolbarButton($$renderer, {
							class: 'p-2 hover:text-gray-900 dark:hover:text-white',
							children: ($$renderer) => {
								ImageSolid($$renderer, { size: 'md' });
								$$renderer.push(`<!----> <span class="sr-only">Upload image</span>`);
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
				rows: 8,
				placeholder: 'Write your message',
				required: true,
				footer,
				$$slots: { footer: true }
			});
		}

		$$renderer.push(`<!----></form>`);
	});
}