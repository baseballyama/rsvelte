import * as $ from 'svelte/internal/server';
import { getComponentDialogCtx } from './component-dialog-context.svelte';
import Content from './content.svelte';
import * as Dialog from '$lib/demo/ui/dialog/index.js';
import * as Drawer from '$lib/demo/ui/drawer/index.js';
import { pushState, replaceState } from '$app/navigation';
import { page } from '$app/state';
import { untrack } from 'svelte';
import { MediaQuery } from 'svelte/reactivity';

export default function Component_dialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const screen = new MediaQuery('(min-width: 768px)');
		const componentDialogCtx = getComponentDialogCtx();
		const originalPath = page.url.pathname;
		let open = $.derived(() => !!componentDialogCtx.component);
		let statePushed = false;
		const targetPath = $.derived(() => `${page.url.pathname}/${componentDialogCtx.component?.name}`);

		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		function handleOpenChange(open) {
			if (!open && statePushed) {
				replaceState(originalPath, {});
				statePushed = false;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (screen.current) {
				$$renderer.push('<!--[0-->');

				if (Dialog.Root) {
					$$renderer.push('<!--[-->');

					Dialog.Root($$renderer, {
						onOpenChange: handleOpenChange,
						get open() {
							return open();
						},

						set open($$value) {
							open($$value);
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Dialog.Portal) {
								$$renderer.push('<!--[-->');

								Dialog.Portal($$renderer, {
									children: ($$renderer) => {
										if (Dialog.Overlay) {
											$$renderer.push('<!--[-->');
											Dialog.Overlay($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Dialog.Content) {
											$$renderer.push('<!--[-->');

											Dialog.Content($$renderer, {
												class: 'block h-auto max-h-[calc(80svh)] max-w-[calc(100svw-5rem)] overflow-y-auto sm:max-w-2xl',
												children: ($$renderer) => {
													Content($$renderer, {
														component: componentDialogCtx.component,
														onGotoComponent: () => {
															open(false);
															replaceState(originalPath, {});
														}
													});
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
			} else {
				$$renderer.push('<!--[-1-->');

				if (Drawer.Root) {
					$$renderer.push('<!--[-->');

					Drawer.Root($$renderer, {
						onOpenChange: handleOpenChange,
						get open() {
							return open();
						},

						set open($$value) {
							open($$value);
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Drawer.Content) {
								$$renderer.push('<!--[-->');

								Drawer.Content($$renderer, {
									class: 'overflow-hidden after:[all:unset]!',
									children: ($$renderer) => {
										$$renderer.push(`<div class="block h-auto max-h-[calc(80svh)] overflow-y-auto sm:max-w-2xl">`);

										Content($$renderer, {
											component: componentDialogCtx.component,
											onGotoComponent: () => {
												open(false);
												replaceState(originalPath, {});
											}
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
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}