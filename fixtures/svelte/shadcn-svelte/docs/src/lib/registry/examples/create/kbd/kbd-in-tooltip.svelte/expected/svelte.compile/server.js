import * as $ from 'svelte/internal/server';
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Kbd_in_tooltip($$renderer) {
	Example($$renderer, {
		title: 'Tooltip',
		children: ($$renderer) => {
			if (Tooltip.Root) {
				$$renderer.push('<!--[-->');

				Tooltip.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									{ size: 'icon-sm', variant: 'outline' },
									props,
									{
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
												lucide: 'SaveIcon',
												tabler: 'IconDeviceFloppy',
												hugeicons: 'FloppyDiskIcon',
												phosphor: 'FloppyDiskIcon',
												remixicon: 'RiSaveLine'
											});
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Tooltip.Trigger) {
								$$renderer.push('<!--[-->');
								Tooltip.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Tooltip.Content) {
							$$renderer.push('<!--[-->');

							Tooltip.Content($$renderer, {
								class: 'pr-1.5',
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex items-center gap-2">Save Changes `);

									if (Kbd.Root) {
										$$renderer.push('<!--[-->');

										Kbd.Root($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->S`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(`</div>`);
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
		},
		$$slots: { default: true }
	});
}