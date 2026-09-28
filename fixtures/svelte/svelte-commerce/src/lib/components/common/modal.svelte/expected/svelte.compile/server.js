import * as $ from 'svelte/internal/server';
import { onDestroy, onMount } from 'svelte';
import { fade } from 'svelte/transition';
import * as Card from '$lib/components/ui/card';
import { ModalRenderer } from '$lib/core/composables/index.js';
import { Button } from '$lib/components/ui/button';
import { dialog } from '$lib/actions/dialog.js';

export default function Modal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const titleId = $.props_id($$renderer);

		let {
			confirmButtonText = 'Submit',
			disableSubmitButton = false,
			hideFooter = false,
			hideHeader = false,
			class: className,
			show = false,
			title = 'Title',
			hAuto = false,
			wAuto = false,
			useMaxHeight = false,
			useMaxWidth = false,
			rounded = true,
			zIndex = 1000000,
			confirmButtonPosition = 'bottom',
			loading,
			manageHistory = true,
			children,
			close,
			submit
		} = $$props;

		const modalHistoryKey = '__svelteCommerceModal';
		let ownsHistoryEntry = false;

		function handleBrowserBack() {
			if (!show || !ownsHistoryEntry) return;

			ownsHistoryEntry = false;
			show = false;
		}

		onMount(() => {
			window.addEventListener('popstate', handleBrowserBack);

			return () => window.removeEventListener('popstate', handleBrowserBack);
		});

		onDestroy(() => {
			if (typeof window !== 'undefined' && manageHistory && ownsHistoryEntry && history.state?.[modalHistoryKey] === true) {
				history.back();
			}
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function content($$renderer, { handleSubmit, handleClose }) {
					if (show) {
						$$renderer.push(`<!--[0--><div${$.attr_style(`z-index: ${$.stringify(zIndex)};`)} role="dialog" aria-modal="true"${$.attr('aria-labelledby', hideHeader ? undefined : titleId)}${$.attr('aria-label', hideHeader ? title : undefined)} tabindex="-1"${$.attr_class(`frosted-black fixed inset-0 h-screen w-full items-center justify-center ${show ? 'flex' : 'hidden'}`, 'svelte-1lvnw2h')}>`);

						if (Card.Root) {
							$$renderer.push('<!--[-->');

							Card.Root($$renderer, {
								class: `overflow-hidden border
        ${rounded ? '' : 'rounded-none'}
        ${wAuto ? '' : useMaxWidth ? 'w-full max-w-[80vw]' : 'width'}
        ${hAuto ? '' : useMaxHeight ? 'max-h-[80vh] ' : 'h-[80vh]'}`,

								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class(`${hAuto ? '' : useMaxHeight ? 'max-h-[80vh] ' : 'h-[80vh]'} overflow-y-auto`)}>`);

									if (!hideHeader) {
										$$renderer.push('<!--[0-->');

										if (Card.Header) {
											$$renderer.push('<!--[-->');

											Card.Header($$renderer, {
												style: `z-index: ${$.stringify(zIndex)};`,
												class: 'sticky top-0 flex w-full flex-row items-center justify-between gap-4 border-b p-4 px-6',
												children: ($$renderer) => {
													$$renderer.push(`<h2${$.attr('id', titleId)} class="text-lg capitalize sm:text-xl">${$.escape(title)}</h2> <div class="flex flex-row gap-3">`);

													if (confirmButtonPosition === 'top') {
														$$renderer.push(`<!--[0--><div class="flex items-center justify-end gap-2">`);

														Button($$renderer, {
															type: 'submit',
															onclick: handleSubmit,
															disabled: disableSubmitButton,
															class: 'min-w-40',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(confirmButtonText)}`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----></div>`);
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--> `);

													Button($$renderer, {
														variant: 'ghost',
														size: 'icon',
														'aria-label': 'Close modal button',
														type: 'button',
														onclick: handleClose,
														children: ($$renderer) => {
															$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>`);
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
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> <form>`);

									if (Card.Content) {
										$$renderer.push('<!--[-->');

										Card.Content($$renderer, {
											class: className,
											children: ($$renderer) => {
												children?.($$renderer);
												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (!hideFooter) {
										$$renderer.push('<!--[0-->');

										if (confirmButtonPosition === 'bottom') {
											$$renderer.push(`<!--[0--><div class="flex items-center justify-end gap-2 border-t p-4">`);

											Button($$renderer, {
												type: 'submit',
												disabled: disableSubmitButton,
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(confirmButtonText)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--></form></div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(`</div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				ModalRenderer($$renderer, {
					disableSubmitButton,
					submit,
					close,
					get show() {
						return show;
					},

					set show($$value) {
						show = $$value;
						$$settled = false;
					},
					content,
					$$slots: { content: true }
				});
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { show });
	});
}