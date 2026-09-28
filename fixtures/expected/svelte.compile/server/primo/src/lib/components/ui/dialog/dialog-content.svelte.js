import * as $ from 'svelte/internal/server';
import { Dialog as DialogPrimitive } from 'bits-ui';
import { X } from 'lucide-svelte';
import * as Dialog from './index.js';
import { cn } from '$lib/utils.js';

export default function Dialog_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			portalProps,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Dialog.Portal) {
				$$renderer.push('<!--[-->');

				Dialog.Portal($$renderer, $.spread_props([
					portalProps,
					{
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

							if (DialogPrimitive.Content) {
								$$renderer.push('<!--[-->');

								DialogPrimitive.Content($$renderer, $.spread_props([
									{
										class: cn('bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed left-[50%] top-[50%] z-[999] grid w-[calc(100vw_-_1rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 sm:rounded-lg origin-top-right', className)
									},
									restProps,
									{
										get ref() {
											return ref;
										},

										set ref($$value) {
											ref = $$value;
											$$settled = false;
										},

										children: ($$renderer) => {
											children?.($$renderer);
											$$renderer.push(`<!----> `);

											if (DialogPrimitive.Close) {
												$$renderer.push('<!--[-->');

												DialogPrimitive.Close($$renderer, {
													class: 'absolute top-4 left-4 justify-self-start self-start ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none',
													children: ($$renderer) => {
														X($$renderer, { class: 'size-4' });
														$$renderer.push(`<!----> <span class="sr-only">Close</span>`);
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
									}
								]));

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					}
				]));

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
		$.bind_props($$props, { ref });
	});
}