import * as $ from 'svelte/internal/server';
import { MediaQuery } from "svelte/reactivity";
import * as Drawer from "$lib/registry/ui/drawer/index.js";
import * as Sheet from "$lib/registry/ui/sheet/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";
import ChartCopyButton from "./chart-copy-button.svelte";
import { getIconForLanguageExtension } from "./icons/icons.js";

function Trigger($$renderer, { props }) {
	Button($$renderer, $.spread_props([
		{ size: 'sm', variant: 'outline' },
		props,
		{
			class: 'h-6 rounded-[6px] border bg-transparent px-2 text-xs text-foreground shadow-none hover:bg-muted dark:text-foreground',
			children: ($$renderer) => {
				$$renderer.push(`<!---->View Code`);
			},
			$$slots: { default: true }
		}
	]));
}

export default function Chart_code_viewer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const isDesktop = new MediaQuery("min-width: 768px");
		let { chart, class: className, children, code } = $$props;
		const Icon = getIconForLanguageExtension("svelte");

		function Content($$renderer) {
			$$renderer.push(`<div class="flex min-h-0 flex-1 flex-col gap-0"><div class="chart-wrapper hidden theme-container **:data-chart:mx-auto **:data-chart:max-h-[35vh] sm:block [&amp;>div]:rounded-none [&amp;>div]:border-0 [&amp;>div]:border-b [&amp;>div]:shadow-none">`);
			children?.($$renderer);
			$$renderer.push(`<!----></div> <div class="flex min-w-0 flex-1 flex-col overflow-hidden p-4"><figure data-rehype-pretty-code-figure="" class="mt-0 flex h-auto min-w-0 flex-1 flex-col overflow-hidden"><figcaption class="flex h-12 shrink-0 items-center gap-2 border-b py-2 ps-4 pe-2 text-foreground [&amp;>svg]:size-4 [&amp;>svg]:text-foreground [&amp;>svg]:opacity-70" data-language="tsx">`);
			Icon($$renderer, {});
			$$renderer.push(`<!----> ${$.escape(chart.name)} <div class="ms-auto flex items-center gap-2">`);
			ChartCopyButton($$renderer, { name: chart.name, code });
			$$renderer.push(`<!----></div></figcaption> <div class="no-scrollbar overflow-y-auto">${$.html(chart.files?.[0]?.highlightedContent ?? "")}</div></figure></div></div>`);
		}

		if (!isDesktop.current) {
			$$renderer.push('<!--[0-->');

			if (Drawer.Root) {
				$$renderer.push('<!--[-->');

				Drawer.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Trigger($$renderer, { props });
							}

							if (Drawer.Trigger) {
								$$renderer.push('<!--[-->');
								Drawer.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Drawer.Content) {
							$$renderer.push('<!--[-->');

							Drawer.Content($$renderer, {
								class: cn("flex max-h-[80vh] flex-col sm:max-h-[90vh] [&>div.bg-muted]:shrink-0", className),
								children: ($$renderer) => {
									if (Drawer.Header) {
										$$renderer.push('<!--[-->');

										Drawer.Header($$renderer, {
											class: 'sr-only',
											children: ($$renderer) => {
												if (Drawer.Title) {
													$$renderer.push('<!--[-->');

													Drawer.Title($$renderer, {
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

												$$renderer.push(` `);

												if (Drawer.Description) {
													$$renderer.push('<!--[-->');

													Drawer.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->View the code for the chart.`);
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

									$$renderer.push(` <div class="flex h-full flex-col overflow-auto">`);
									Content($$renderer);
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
		} else {
			$$renderer.push('<!--[-1-->');

			if (Sheet.Root) {
				$$renderer.push('<!--[-->');

				Sheet.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Trigger($$renderer, { props });
							}

							if (Sheet.Trigger) {
								$$renderer.push('<!--[-->');
								Sheet.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Sheet.Content) {
							$$renderer.push('<!--[-->');

							Sheet.Content($$renderer, {
								side: 'right',
								class: cn("flex flex-col gap-0 border-s-0 p-0 sm:max-w-sm md:w-[700px] md:max-w-[700px] dark:border-s", className),
								children: ($$renderer) => {
									if (Sheet.Header) {
										$$renderer.push('<!--[-->');

										Sheet.Header($$renderer, {
											class: 'sr-only',
											children: ($$renderer) => {
												if (Sheet.Title) {
													$$renderer.push('<!--[-->');

													Sheet.Title($$renderer, {
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

												$$renderer.push(` `);

												if (Sheet.Description) {
													$$renderer.push('<!--[-->');

													Sheet.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->View the code for the chart.`);
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
									Content($$renderer);
									$$renderer.push(`<!---->`);
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
		}

		$$renderer.push(`<!--]-->`);
	});
}