import * as $ from 'svelte/internal/server';
import CheckIcon from "@lucide/svelte/icons/check";
import FullscreenIcon from "@lucide/svelte/icons/fullscreen";
import MonitorIcon from "@lucide/svelte/icons/monitor";
import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
import SmartphoneIcon from "@lucide/svelte/icons/smartphone";
import TabletIcon from "@lucide/svelte/icons/tablet";
import TerminalIcon from "@lucide/svelte/icons/terminal";
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte.js";
import { getCommand } from "$lib/package-manager.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";
import { UserConfigContext } from "$lib/user-config.svelte.js";
import { BlockViewerContext } from "./block-viewer.svelte";

export default function Block_viewer_toolbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ctx = BlockViewerContext.get();
		const userConfig = UserConfigContext.get();
		const clipboard = new UseClipboard();
		const addCommand = $.derived(() => getCommand(userConfig.current.packageManager, "execute", `shadcn-svelte@latest add ${ctx.item.name}`));
		const command = $.derived(() => addCommand().command + " " + addCommand().args.join(" "));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="hidden w-full items-center gap-2 ps-2 md:pe-6 lg:flex">`);

			if (Tabs.Root) {
				$$renderer.push('<!--[-->');

				Tabs.Root($$renderer, {
					class: 'hidden lg:flex',
					get value() {
						return ctx.view;
					},

					set value($$value) {
						ctx.view = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Tabs.List) {
							$$renderer.push('<!--[-->');

							Tabs.List($$renderer, {
								class: 'grid h-8 grid-cols-2 items-center rounded-md p-1 *:data-[slot=tabs-trigger]:h-6 *:data-[slot=tabs-trigger]:rounded-sm *:data-[slot=tabs-trigger]:px-2 *:data-[slot=tabs-trigger]:text-xs',
								children: ($$renderer) => {
									if (Tabs.Trigger) {
										$$renderer.push('<!--[-->');

										Tabs.Trigger($$renderer, {
											value: 'preview',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Preview`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tabs.Trigger) {
										$$renderer.push('<!--[-->');

										Tabs.Trigger($$renderer, {
											value: 'code',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Code`);
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

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);
			Separator($$renderer, { orientation: 'vertical', class: 'mx-2 !h-4' });
			$$renderer.push(`<!----> <a${$.attr('href', `#${$.stringify(ctx.item.name)}`)} class="flex-1 text-center text-sm font-medium underline-offset-2 hover:underline md:flex-auto md:text-start">${$.escape(ctx.item.description?.replace(/\.$/, ""))}</a> <div class="ms-auto flex items-center gap-2"><div class="h-8 items-center gap-1.5 rounded-md border p-1 shadow-none">`);

			if (ToggleGroup.Root) {
				$$renderer.push('<!--[-->');

				ToggleGroup.Root($$renderer, {
					type: 'single',
					value: '100',
					onValueChange: (value) => {
						if (ctx.resizablePaneRef) {
							ctx.resizablePaneRef.resize(parseInt(value));
						}
					},
					class: 'gap-1 *:data-[slot=toggle-group-item]:!size-6 *:data-[slot=toggle-group-item]:!rounded-sm',
					children: ($$renderer) => {
						if (ToggleGroup.Item) {
							$$renderer.push('<!--[-->');

							ToggleGroup.Item($$renderer, {
								value: '100',
								title: 'Desktop',
								children: ($$renderer) => {
									MonitorIcon($$renderer, {});
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (ToggleGroup.Item) {
							$$renderer.push('<!--[-->');

							ToggleGroup.Item($$renderer, {
								value: '60',
								title: 'Tablet',
								children: ($$renderer) => {
									TabletIcon($$renderer, {});
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (ToggleGroup.Item) {
							$$renderer.push('<!--[-->');

							ToggleGroup.Item($$renderer, {
								value: '30',
								title: 'Mobile',
								children: ($$renderer) => {
									SmartphoneIcon($$renderer, {});
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);
						Separator($$renderer, { orientation: 'vertical', class: '!h-4' });
						$$renderer.push(`<!----> `);

						Button($$renderer, {
							size: 'icon',
							variant: 'ghost',
							class: 'size-6 rounded-sm p-0',
							title: 'Open in New Tab',
							href: `/view/${$.stringify(ctx.item.name)}`,
							target: '_blank',
							children: ($$renderer) => {
								$$renderer.push(`<span class="sr-only">Open in New Tab</span> `);
								FullscreenIcon($$renderer, {});
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);
						Separator($$renderer, { orientation: 'vertical', class: '!h-4' });
						$$renderer.push(`<!----> `);

						Button($$renderer, {
							size: 'icon',
							variant: 'ghost',
							class: 'size-6 rounded-sm p-0',
							title: 'Refresh Preview',
							onclick: () => {
								ctx.iframeKey = ctx.iframeKey + 1;
							},

							children: ($$renderer) => {
								RotateCcwIcon($$renderer, {});
								$$renderer.push(`<!----> <span class="sr-only">Refresh Preview</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div> `);
			Separator($$renderer, { orientation: 'vertical', class: 'mx-1 !h-4' });
			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'outline',
				class: 'w-fit gap-1 px-2 shadow-none',
				size: 'sm',
				onclick: () => clipboard.copy(command()),
				children: ($$renderer) => {
					if (clipboard.copied) {
						$$renderer.push('<!--[0-->');
						CheckIcon($$renderer, {});
					} else {
						$$renderer.push('<!--[-1-->');
						TerminalIcon($$renderer, {});
					}

					$$renderer.push(`<!--]--> <span class="hidden lg:inline">${$.escape(command())}</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}