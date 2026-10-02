import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy, onMount } from 'svelte';
import { fade } from 'svelte/transition';
import * as Card from '$lib/components/ui/card';
import { ModalRenderer } from '$lib/core/composables/index.js';
import { Button } from '$lib/components/ui/button';
import { dialog } from '$lib/actions/dialog.js';

var root = $.from_html(`<div class="flex items-center justify-end gap-2"><!></div>`);
var root_1 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>`);
var root_2 = $.from_html(`<h2 class="text-lg capitalize sm:text-xl"> </h2> <div class="flex flex-row gap-3"><!> <!></div>`, 1);
var root_3 = $.from_html(`<div class="flex items-center justify-end gap-2 border-t p-4"><!></div>`);
var root_4 = $.from_html(`<div><!> <form><!> <!></form></div>`);
var root_5 = $.from_html(`<div role="dialog" aria-modal="true" tabindex="-1"><!></div>`);

export default function Modal($$anchor, $$props) {
	const titleId = $.props_id();

	$.push($$props, true);

	let confirmButtonText = $.prop($$props, 'confirmButtonText', 3, 'Submit'),
		disableSubmitButton = $.prop($$props, 'disableSubmitButton', 3, false),
		hideFooter = $.prop($$props, 'hideFooter', 3, false),
		hideHeader = $.prop($$props, 'hideHeader', 3, false),
		show = $.prop($$props, 'show', 15, false),
		title = $.prop($$props, 'title', 3, 'Title'),
		hAuto = $.prop($$props, 'hAuto', 3, false),
		wAuto = $.prop($$props, 'wAuto', 3, false),
		useMaxHeight = $.prop($$props, 'useMaxHeight', 3, false),
		useMaxWidth = $.prop($$props, 'useMaxWidth', 3, false),
		rounded = $.prop($$props, 'rounded', 3, true),
		zIndex = $.prop($$props, 'zIndex', 3, 1000000),
		confirmButtonPosition = $.prop($$props, 'confirmButtonPosition', 3, 'bottom'),
		manageHistory = $.prop($$props, 'manageHistory', 3, true);

	const modalHistoryKey = '__svelteCommerceModal';
	let ownsHistoryEntry = false;

	function handleBrowserBack() {
		if (!show() || !ownsHistoryEntry) return;

		ownsHistoryEntry = false;
		show(false);
	}

	onMount(() => {
		window.addEventListener('popstate', handleBrowserBack);

		return () => window.removeEventListener('popstate', handleBrowserBack);
	});

	$.user_effect(() => {
		if (typeof window === 'undefined' || !manageHistory()) return;

		if (show() && !ownsHistoryEntry) {
			history.pushState({ ...history.state, [modalHistoryKey]: true }, '', window.location.href);
			ownsHistoryEntry = true;
		} else if (!show() && ownsHistoryEntry) {
			const isCurrentModalEntry = history.state?.[modalHistoryKey] === true;

			ownsHistoryEntry = false;

			if (isCurrentModalEntry) history.back();
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined' && manageHistory() && ownsHistoryEntry && history.state?.[modalHistoryKey] === true) {
			history.back();
		}
	});

	{
		const content = ($$anchor, $$arg0) => {
			let handleSubmit = () => ($$arg0?.()).handleSubmit;
			let handleClose = () => ($$arg0?.()).handleClose;
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent_4 = ($$anchor) => {
					var div = root_5();
					var node_1 = $.child(div);

					{
						let $0 = $.derived(() => rounded() ? '' : 'rounded-none');
						let $1 = $.derived(() => wAuto() ? '' : useMaxWidth() ? 'w-full max-w-[80vw]' : 'width');
						let $2 = $.derived(() => hAuto() ? '' : useMaxHeight() ? 'max-h-[80vh] ' : 'h-[80vh]');

						$.component(node_1, () => Card.Root, ($$anchor, Card_Root) => {
							Card_Root($$anchor, {
								get class() {
									return `overflow-hidden border
        ${$.get($0) ?? ''}
        ${$.get($1) ?? ''}
        ${$.get($2) ?? ''}`;
								},

								children: ($$anchor, $$slotProps) => {
									var div_1 = root_4();
									var node_2 = $.child(div_1);

									{
										var consequent_1 = ($$anchor) => {
											var fragment_2 = $.comment();
											var node_3 = $.first_child(fragment_2);

											$.component(node_3, () => Card.Header, ($$anchor, Card_Header) => {
												Card_Header($$anchor, {
													get style() {
														return `z-index: ${zIndex() ?? ''};`;
													},
													class: 'sticky top-0 flex w-full flex-row items-center justify-between gap-4 border-b p-4 px-6',
													children: ($$anchor, $$slotProps) => {
														var fragment_3 = root_2();
														var h2 = $.first_child(fragment_3);
														var text = $.only_child(h2, true);
														var div_2 = $.sibling(h2, 2);
														var node_4 = $.child(div_2);

														{
															var consequent = ($$anchor) => {
																var div_3 = root();
																var node_5 = $.child(div_3);

																Button(node_5, {
																	type: 'submit',
																	get onclick() {
																		return handleSubmit();
																	},

																	get disabled() {
																		return disableSubmitButton();
																	},
																	class: 'min-w-40',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text();

																		$.template_effect(() => $.set_text(text_1, confirmButtonText()));
																		$.append($$anchor, text_1);
																	},
																	$$slots: { default: true }
																});

																$.reset(div_3);
																$.append($$anchor, div_3);
															};

															$.if(node_4, ($$render) => {
																if (confirmButtonPosition() === 'top') $$render(consequent);
															});
														}

														var node_6 = $.sibling(node_4, 2);

														Button(node_6, {
															variant: 'ghost',
															size: 'icon',
															'aria-label': 'Close modal button',
															type: 'button',
															get onclick() {
																return handleClose();
															},

															children: ($$anchor, $$slotProps) => {
																var svg = root_1();

																$.append($$anchor, svg);
															},
															$$slots: { default: true }
														});

														$.reset(div_2);

														$.template_effect(() => {
															$.set_attribute(h2, 'id', titleId);
															$.set_text(text, title());
														});

														$.append($$anchor, fragment_3);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_2);
										};

										$.if(node_2, ($$render) => {
											if (!hideHeader()) $$render(consequent_1);
										});
									}

									var form = $.sibling(node_2, 2);
									var node_7 = $.child(form);

									$.component(node_7, () => Card.Content, ($$anchor, Card_Content) => {
										Card_Content($$anchor, {
											get class() {
												return $$props.class;
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_5 = $.comment();
												var node_8 = $.first_child(fragment_5);

												$.snippet(node_8, () => $$props.children ?? $.noop);
												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									var node_9 = $.sibling(node_7, 2);

									{
										var consequent_3 = ($$anchor) => {
											var fragment_6 = $.comment();
											var node_10 = $.first_child(fragment_6);

											{
												var consequent_2 = ($$anchor) => {
													var div_4 = root_3();
													var node_11 = $.child(div_4);

													Button(node_11, {
														type: 'submit',
														get disabled() {
															return disableSubmitButton();
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text();

															$.template_effect(() => $.set_text(text_2, confirmButtonText()));
															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});

													$.reset(div_4);
													$.append($$anchor, div_4);
												};

												$.if(node_10, ($$render) => {
													if (confirmButtonPosition() === 'bottom') $$render(consequent_2);
												});
											}

											$.append($$anchor, fragment_6);
										};

										$.if(node_9, ($$render) => {
											if (!hideFooter()) $$render(consequent_3);
										});
									}

									$.reset(form);
									$.reset(div_1);
									$.template_effect(() => $.set_class(div_1, 1, `${hAuto() ? '' : useMaxHeight() ? 'max-h-[80vh] ' : 'h-[80vh]'} overflow-y-auto`));

									$.event('submit', form, function (...$$args) {
										handleSubmit()?.apply(this, $$args);
									});

									$.append($$anchor, div_1);
								},
								$$slots: { default: true }
							});
						});
					}

					$.reset(div);
					$.action(div, ($$node, $$action_arg) => dialog?.($$node, $$action_arg), handleClose);

					$.template_effect(() => {
						$.set_style(div, `z-index: ${zIndex() ?? ''};`);
						$.set_attribute(div, 'aria-labelledby', hideHeader() ? undefined : titleId);
						$.set_attribute(div, 'aria-label', hideHeader() ? title() : undefined);

						$.set_class(
							div,
							1,
							`frosted-black fixed inset-0 h-screen w-full items-center justify-center
      ${show() ? 'flex' : 'hidden'}`,
							'svelte-1lvnw2h'
						);
					});

					$.transition(3, div, () => fade, () => ({ duration: 100 }));
					$.append($$anchor, div);
				};

				$.if(node, ($$render) => {
					if (show()) $$render(consequent_4);
				});
			}

			$.append($$anchor, fragment_1);
		};

		ModalRenderer($$anchor, {
			get disableSubmitButton() {
				return disableSubmitButton();
			},

			get submit() {
				return $$props.submit;
			},

			get close() {
				return $$props.close;
			},

			get show() {
				return show();
			},

			set show($$value) {
				show($$value);
			},
			content,
			$$slots: { content: true }
		});
	}

	$.pop();
}