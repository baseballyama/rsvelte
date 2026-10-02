import * as $ from 'svelte/internal/server';
import { Copy } from '$lib/components';
import { writable } from 'svelte/store';
import { Button, Form } from '$lib/elements/forms';
import { isTabletViewport } from '$lib/stores/viewport';
import { Badge, Divider, Layout, Sheet, Tag, Typography } from '@appwrite.io/pink-svelte';
import { beforeNavigate } from '$app/navigation';

export default function Sidesheet($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			show = false,
			title,
			closeOnBlur = false,
			submit,
			cancel,
			children = null,
			footer = null,
			titleBadge = null,
			topAction = null,
			topEndActions = null,
			noContentPadding = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let form;
		let submitting = writable(false);
		let copyText = undefined;

		// hide on a nav trigger!
		beforeNavigate(() => show = false);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attributes(
				{
					class: 'sheet-container',
					'data-side-sheet-visible': show,
					...restProps
				},
				'svelte-i1ah7x',
				{ noContentPadding }
			)}>`);

			Sheet($$renderer, {
				closeOnBlur,
				get open() {
					return show;
				},

				set open($$value) {
					show = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							direction: 'column',
							justifyContent: 'space-evenly',
							children: ($$renderer) => {
								Form($$renderer, {
									onSubmit: async () => {
										try {
											const keepOpen = await submit?.onClick?.();

											if (!keepOpen) {
												show = false;
											}
										} catch(error) {
											// error occurred, dont close the sidebar
										}
									},

									get isSubmitting() {
										return submitting;
									},

									set isSubmitting($$value) {
										submitting = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												gap: 'xl',
												class: 'sheet-content',
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
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								if (submit) {
									$$renderer.push(`<!--[0--><div class="sheet-footer svelte-i1ah7x">`);

									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											gap: 'l',
											children: ($$renderer) => {
												Divider($$renderer, {});
												$$renderer.push(`<!----> <div class="sheet-footer-actions svelte-i1ah7x">`);

												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														gap: 'm',
														direction: 'row',
														justifyContent: 'flex-end',
														alignItems: 'center',
														children: ($$renderer) => {
															if (footer) {
																$$renderer.push('<!--[0-->');
																footer?.($$renderer);
																$$renderer.push(`<!---->`);
															} else {
																$$renderer.push('<!--[-1-->');
															}

															$$renderer.push(`<!--]--> `);

															Button($$renderer, {
																size: 's',
																secondary: true,
																disabled: cancel?.disabled,
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(cancel?.text ?? 'Cancel')}`);
																},
																$$slots: { default: true }
															});

															$$renderer.push(`<!----> `);

															Button($$renderer, {
																size: 's',
																submit: true,
																disabled: submit.disabled || $.store_get($$store_subs ??= {}, '$submitting', submitting),
																forceShowLoader: $.store_get($$store_subs ??= {}, '$submitting', submitting) && $.store_get($$store_subs ??= {}, '$isTabletViewport', isTabletViewport),
																submissionLoader: $.store_get($$store_subs ??= {}, '$submitting', submitting) && $.store_get($$store_subs ??= {}, '$isTabletViewport', isTabletViewport),
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(submit.text)}`);
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

												$$renderer.push(`</div>`);
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
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},

				$$slots: {
					default: true,
					header: ($$renderer) => {
						$$renderer.push(`<div slot="header"${$.attr_style('', { width: '100%' })}>`);

						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								direction: 'row',
								justifyContent: 'space-between',
								alignItems: 'center',
								children: ($$renderer) => {
									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											direction: 'row',
											gap: 'm',
											alignItems: 'center',
											children: ($$renderer) => {
												if (Typography.Text) {
													$$renderer.push('<!--[-->');

													Typography.Text($$renderer, {
														variant: 'm-400',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(title)}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (titleBadge) {
													$$renderer.push('<!--[0-->');
													Badge($$renderer, { variant: 'secondary', content: titleBadge, size: 's' });
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--> `);

												if (topAction && topAction.text && topAction.show) {
													$$renderer.push('<!--[0-->');

													if (topAction.mode === 'copy-tag') {
														$$renderer.push('<!--[0-->');

														Copy($$renderer, {
															value: topAction.value,
															copyText,
															children: ($$renderer) => {
																Tag($$renderer, {
																	size: 'xs',
																	variant: 'code',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(topAction.text)}`);
																	},
																	$$slots: { default: true }
																});
															},
															$$slots: { default: true }
														});
													} else {
														$$renderer.push('<!--[-1-->');

														Button($$renderer, {
															extraCompact: true,
															text: true,
															size: 'xs',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(topAction.text)}`);
															},
															$$slots: { default: true }
														});
													}

													$$renderer.push(`<!--]-->`);
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (topEndActions) {
										$$renderer.push('<!--[0-->');

										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												direction: 'row',
												gap: 'xs',
												alignItems: 'center',
												inline: true,
												children: ($$renderer) => {
													topEndActions($$renderer);
													$$renderer.push(`<!---->`);
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

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(`</div>`);
					}
				}
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { show });
	});
}