import * as $ from 'svelte/internal/server';
import CopyIcon from "@lucide/svelte/icons/copy";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { Button, buttonVariants } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Preset_share($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (Popover.Root) {
			$$renderer.push('<!--[-->');

			Popover.Root($$renderer, {
				children: ($$renderer) => {
					if (Popover.Trigger) {
						$$renderer.push('<!--[-->');

						Popover.Trigger($$renderer, {
							class: buttonVariants({ variant: "secondary" }),
							children: ($$renderer) => {
								$$renderer.push(`<!---->Share`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Popover.Content) {
						$$renderer.push('<!--[-->');

						Popover.Content($$renderer, {
							class: 'w-[520px]',
							align: 'end',
							children: ($$renderer) => {
								$$renderer.push(`<div class="flex flex-col space-y-2 text-center sm:text-start"><h3 class="text-lg font-semibold">Share preset</h3> <p class="text-sm text-muted-foreground">Anyone who has this link and an OpenAI account will be able to view this.</p></div> <div class="flex items-center space-x-2 pt-4"><div class="grid flex-1 gap-2">`);

								Label($$renderer, {
									for: 'link',
									class: 'sr-only',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Link`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Input($$renderer, {
									id: 'link',
									value: 'https://platform.openai.com/playground/p/7bbKYQvsVkNmVb8NGcdUOLae?model=text-davinci-003',
									readonly: true,
									class: 'h-9'
								});

								$$renderer.push(`<!----></div> `);

								Button($$renderer, {
									type: 'submit',
									size: 'sm',
									class: 'px-3',
									children: ($$renderer) => {
										$$renderer.push(`<span class="sr-only">Copy</span> `);
										CopyIcon($$renderer, {});
										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}