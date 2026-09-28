import * as $ from 'svelte/internal/server';
import * as Tabs from "$lib/components/ui/tabs/index.js";
import * as Frame from "$lib/components/ui/frame/index.js";
import MultipleCode from "$lib/components/ui/code/multiple-code.svelte";
import SingleCodeFilename from "../code/single-code-filename.svelte";
import { Button } from "$lib/components/ui/button";
import { cn } from "$lib/utils";

export default function Preview_component($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			code,
			children,
			lang = "svelte",
			showRetry = true,
			isCentered = true,
			class: className = ""
		} = $$props;

		let value = "preview";
		let retryKey = 0;

		function handleRetry() {
			retryKey += 1;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="mt-2 w-full">`);

			if (Tabs.Root) {
				$$renderer.push('<!--[-->');

				Tabs.Root($$renderer, {
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Tabs.List) {
							$$renderer.push('<!--[-->');

							Tabs.List($$renderer, {
								class: 'bg-transparent',
								children: ($$renderer) => {
									if (Tabs.Trigger) {
										$$renderer.push('<!--[-->');

										Tabs.Trigger($$renderer, {
											value: 'preview',
											class: 'border-none bg-transparent! pl-0 text-base shadow-none! ',
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
											class: 'group border-none bg-transparent! text-base shadow-none! ',
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

			$$renderer.push(` <div class="mt-1" data-toc-ignore="">`);

			if (value === "preview") {
				$$renderer.push('<!--[0-->');

				if (Frame.Root) {
					$$renderer.push('<!--[-->');

					Frame.Root($$renderer, {
						children: ($$renderer) => {
							if (Frame.Panel) {
								$$renderer.push('<!--[-->');

								Frame.Panel($$renderer, {
									class: cn("relative min-h-64 w-full overflow-hidden p-6", className),
									children: ($$renderer) => {
										if (showRetry) {
											$$renderer.push('<!--[0-->');

											Button($$renderer, {
												variant: 'secondary',
												size: 'icon',
												onclick: handleRetry,
												class: 'absolute top-1.5 right-1.5 z-30',
												children: ($$renderer) => {
													$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-cw-icon lucide-rotate-cw"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>`);
												},
												$$slots: { default: true }
											});
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> <!---->`);

										{
											if (children) {
												$$renderer.push('<!--[0-->');
												children?.($$renderer);
												$$renderer.push(`<!---->`);
											} else {
												$$renderer.push(`<!--[-1--><p class="text-muted-foreground">No component provided. Please provide a component to render.</p>`);
											}

											$$renderer.push(`<!--]-->`);
										}

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
			} else if (value === "code") {
				$$renderer.push(`<!--[1--><div>`);

				if (Array.isArray(code)) {
					$$renderer.push('<!--[0-->');
					MultipleCode($$renderer, { code });
				} else if (code) {
					$$renderer.push('<!--[1-->');
					SingleCodeFilename($$renderer, { code });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}