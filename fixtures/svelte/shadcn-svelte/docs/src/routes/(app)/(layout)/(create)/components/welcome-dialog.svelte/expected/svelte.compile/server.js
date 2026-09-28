import * as $ from 'svelte/internal/server';
import { PersistedState } from "runed";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import Logo from "$lib/components/logo.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Welcome_dialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dismissed = new PersistedState("shadcn-create-welcome-dialog", false);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			var bind_get = () => !dismissed.current;
			var bind_set = (v) => dismissed.current = !v;

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return bind_get();
					},

					set open($$value) {
						bind_set($$value);
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								showCloseButton: false,
								class: 'dialog-ring max-w-92 min-w-0 gap-0 overflow-hidden rounded-xl p-0 sm:max-w-sm dark:bg-neutral-900',
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex aspect-[2/1.2] w-full items-center justify-center rounded-t-xl bg-neutral-950 text-center text-neutral-100 sm:aspect-2/1"><div class="font-mono text-2xl font-bold">`);
									Logo($$renderer, { class: 'size-12' });
									$$renderer.push(`<!----></div></div> `);

									if (Dialog.Header) {
										$$renderer.push('<!--[-->');

										Dialog.Header($$renderer, {
											class: 'gap-1 p-4',
											children: ($$renderer) => {
												if (Dialog.Title) {
													$$renderer.push('<!--[-->');

													Dialog.Title($$renderer, {
														class: 'text-left text-base',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Build your own shadcn-svelte`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Dialog.Description) {
													$$renderer.push('<!--[-->');

													Dialog.Description($$renderer, {
														class: 'text-left leading-relaxed text-foreground',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Customize everything from the ground up. Pick your component library, font, color scheme,
				and more.`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Dialog.Description) {
													$$renderer.push('<!--[-->');

													Dialog.Description($$renderer, {
														class: 'mt-2 text-left leading-relaxed font-medium text-foreground',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Available for SvelteKit, Vite, and Astro.`);
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

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											class: 'm-0',
											children: ($$renderer) => {
												{
													function child($$renderer, { props }) {
														Button($$renderer, $.spread_props([
															{ class: 'w-full rounded-lg shadow-none' },
															props,
															{
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Get Started`);
																},
																$$slots: { default: true }
															}
														]));
													}

													if (Dialog.Close) {
														$$renderer.push('<!--[-->');
														Dialog.Close($$renderer, { child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}