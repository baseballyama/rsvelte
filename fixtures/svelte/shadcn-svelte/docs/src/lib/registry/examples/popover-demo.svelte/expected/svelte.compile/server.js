import * as $ from 'svelte/internal/server';
import * as Popover from "$lib/registry/ui/popover/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Popover_demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (Popover.Root) {
			$$renderer.push('<!--[-->');

			Popover.Root($$renderer, {
				children: ($$renderer) => {
					if (Popover.Trigger) {
						$$renderer.push('<!--[-->');

						Popover.Trigger($$renderer, {
							class: buttonVariants({ variant: "outline" }),
							children: ($$renderer) => {
								$$renderer.push(`<!---->Open popover`);
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
							class: 'w-80',
							children: ($$renderer) => {
								$$renderer.push(`<div class="grid gap-4"><div class="space-y-2"><h4 class="leading-none font-medium">Dimensions</h4> <p class="text-sm text-muted-foreground">Set the dimensions for the layer.</p></div> <div class="grid gap-2"><div class="grid grid-cols-3 items-center gap-4">`);

								Label($$renderer, {
									for: 'width',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Width`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);
								Input($$renderer, { id: 'width', value: '100%', class: 'col-span-2 h-8' });
								$$renderer.push(`<!----></div> <div class="grid grid-cols-3 items-center gap-4">`);

								Label($$renderer, {
									for: 'maxWidth',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Max. width`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);
								Input($$renderer, { id: 'maxWidth', value: '300px', class: 'col-span-2 h-8' });
								$$renderer.push(`<!----></div> <div class="grid grid-cols-3 items-center gap-4">`);

								Label($$renderer, {
									for: 'height',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Height`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);
								Input($$renderer, { id: 'height', value: '25px', class: 'col-span-2 h-8' });
								$$renderer.push(`<!----></div> <div class="grid grid-cols-3 items-center gap-4">`);

								Label($$renderer, {
									for: 'maxHeight',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Max. height`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);
								Input($$renderer, { id: 'maxHeight', value: 'none', class: 'col-span-2 h-8' });
								$$renderer.push(`<!----></div></div></div>`);
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