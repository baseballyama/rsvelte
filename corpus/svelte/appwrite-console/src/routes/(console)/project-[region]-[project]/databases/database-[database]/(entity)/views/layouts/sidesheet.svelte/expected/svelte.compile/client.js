import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Copy } from '$lib/components';
import { writable } from 'svelte/store';
import { Button, Form } from '$lib/elements/forms';
import { isTabletViewport } from '$lib/stores/viewport';
import { Badge, Divider, Layout, Sheet, Tag, Typography } from '@appwrite.io/pink-svelte';
import { beforeNavigate } from '$app/navigation';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'show',
	'title',
	'closeOnBlur',
	'submit',
	'cancel',
	'children',
	'footer',
	'titleBadge',
	'topAction',
	'topEndActions',
	'noContentPadding'
]);

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="sheet-footer-actions svelte-i1ah7x"><!></div>`, 1);
var root_2 = $.from_html(`<div class="sheet-footer svelte-i1ah7x"><!></div>`);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div slot="header"><!></div>`);
var root_5 = $.from_html(`<div><!></div>`);

export default function Sidesheet($$anchor, $$props) {
	$.push($$props, true);

	const $submitting = () => $.store_get($.get(submitting), '$submitting', $$stores);
	const $isTabletViewport = () => $.store_get(isTabletViewport, '$isTabletViewport', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let show = $.prop($$props, 'show', 15, false),
		closeOnBlur = $.prop($$props, 'closeOnBlur', 3, false),
		children = $.prop($$props, 'children', 3, null),
		footer = $.prop($$props, 'footer', 3, null),
		titleBadge = $.prop($$props, 'titleBadge', 3, null),
		topAction = $.prop($$props, 'topAction', 3, null),
		topEndActions = $.prop($$props, 'topEndActions', 3, null),
		noContentPadding = $.prop($$props, 'noContentPadding', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let form;
	let submitting = $.state($.proxy(writable(false)));
	let copyText = undefined;

	// hide on a nav trigger!
	beforeNavigate(() => show(false));

	var div = root_5();

	$.attribute_effect(
		div,
		() => ({
			class: 'sheet-container',
			'data-side-sheet-visible': show(),
			...restProps,
			[$.CLASS]: { noContentPadding: noContentPadding() }
		}),
		void 0,
		void 0,
		void 0,
		'svelte-i1ah7x'
	);

	var node = $.child(div);

	Sheet(node, {
		get closeOnBlur() {
			return closeOnBlur();
		},

		get open() {
			return show();
		},

		set open($$value) {
			show($$value);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					direction: 'column',
					justifyContent: 'space-evenly',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_3();
						var node_2 = $.first_child(fragment_1);

						$.bind_this(
							Form(node_2, {
								onSubmit: async () => {
									try {
										const keepOpen = await $$props.submit?.onClick?.();

										if (!keepOpen) {
											show(false);
										}
									} catch(error) {
										// error occurred, dont close the sidebar
									}
								},

								get isSubmitting() {
									return $.get(submitting);
								},

								set isSubmitting($$value) {
									$.store_unsub($.set(submitting, $$value, true), '$submitting', $$stores);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_2 = $.comment();
									var node_3 = $.first_child(fragment_2);

									$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
										Layout_Stack_1($$anchor, {
											gap: 'xl',
											class: 'sheet-content',
											children: ($$anchor, $$slotProps) => {
												var fragment_3 = $.comment();
												var node_4 = $.first_child(fragment_3);

												$.snippet(node_4, () => children() ?? $.noop);
												$.append($$anchor, fragment_3);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							}),
							($$value) => form = $$value,
							() => form
						);

						var node_5 = $.sibling(node_2, 2);

						{
							var consequent_1 = ($$anchor) => {
								var div_1 = root_2();
								var node_6 = $.child(div_1);

								$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
									Layout_Stack_2($$anchor, {
										gap: 'l',
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root_1();
											var node_7 = $.first_child(fragment_4);

											Divider(node_7, {});

											var div_2 = $.sibling(node_7, 2);
											var node_8 = $.child(div_2);

											$.component(node_8, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
												Layout_Stack_3($$anchor, {
													gap: 'm',
													direction: 'row',
													justifyContent: 'flex-end',
													alignItems: 'center',
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = root();
														var node_9 = $.first_child(fragment_5);

														{
															var consequent = ($$anchor) => {
																var fragment_6 = $.comment();
																var node_10 = $.first_child(fragment_6);

																$.snippet(node_10, () => footer() ?? $.noop);
																$.append($$anchor, fragment_6);
															};

															$.if(node_9, ($$render) => {
																if (footer()) $$render(consequent);
															});
														}

														var node_11 = $.sibling(node_9, 2);

														{
															let $0 = $.derived(() => $$props.cancel?.disabled);

															Button(node_11, {
																size: 's',
																secondary: true,
																get disabled() {
																	return $.get($0);
																},

																$$events: {
																	click: () => {
																		if ($$props.cancel?.onClick) {
																			$$props.cancel.onClick();
																		} else {
																			show(false);
																		}
																	}
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text = $.text();

																	$.template_effect(() => $.set_text(text, $$props.cancel?.text ?? 'Cancel'));
																	$.append($$anchor, text);
																},
																$$slots: { default: true }
															});
														}

														var node_12 = $.sibling(node_11, 2);

														{
															let $0 = $.derived(() => $$props.submit.disabled || $submitting());
															let $1 = $.derived(() => $submitting() && $isTabletViewport());
															let $2 = $.derived(() => $submitting() && $isTabletViewport());

															Button(node_12, {
																size: 's',
																submit: true,
																get disabled() {
																	return $.get($0);
																},

																get forceShowLoader() {
																	return $.get($1);
																},

																get submissionLoader() {
																	return $.get($2);
																},
																$$events: { click: () => form?.triggerSubmit() },
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_1 = $.text();

																	$.template_effect(() => $.set_text(text_1, $$props.submit.text));
																	$.append($$anchor, text_1);
																},
																$$slots: { default: true }
															});
														}

														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											});

											$.reset(div_2);
											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								$.reset(div_1);
								$.append($$anchor, div_1);
							};

							$.if(node_5, ($$render) => {
								if ($$props.submit) $$render(consequent_1);
							});
						}

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},

		$$slots: {
			default: true,
			header: ($$anchor, $$slotProps) => {
				var div_3 = root_4();

				$.set_style(div_3, '', {}, { width: '100%' });

				var node_13 = $.child(div_3);

				$.component(node_13, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
					Layout_Stack_4($$anchor, {
						direction: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
						children: ($$anchor, $$slotProps) => {
							var fragment_9 = root_3();
							var node_14 = $.first_child(fragment_9);

							$.component(node_14, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
								Layout_Stack_5($$anchor, {
									direction: 'row',
									gap: 'm',
									alignItems: 'center',
									children: ($$anchor, $$slotProps) => {
										var fragment_10 = root();
										var node_15 = $.first_child(fragment_10);

										$.component(node_15, () => Typography.Text, ($$anchor, Typography_Text) => {
											Typography_Text($$anchor, {
												variant: 'm-400',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text();

													$.template_effect(() => $.set_text(text_2, $$props.title));
													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_16 = $.sibling(node_15, 2);

										{
											var consequent_2 = ($$anchor) => {
												Badge($$anchor, {
													variant: 'secondary',
													get content() {
														return titleBadge();
													},
													size: 's'
												});
											};

											$.if(node_16, ($$render) => {
												if (titleBadge()) $$render(consequent_2);
											});
										}

										var node_17 = $.sibling(node_16, 2);

										{
											var consequent_4 = ($$anchor) => {
												var fragment_13 = $.comment();
												var node_18 = $.first_child(fragment_13);

												{
													var consequent_3 = ($$anchor) => {
														Copy($$anchor, {
															get value() {
																return topAction().value;
															},
															copyText,
															children: ($$anchor, $$slotProps) => {
																Tag($$anchor, {
																	size: 'xs',
																	variant: 'code',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text();

																		$.template_effect(() => $.set_text(text_3, topAction().text));
																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															},
															$$slots: { default: true }
														});
													};

													var alternate = ($$anchor) => {
														Button($$anchor, {
															extraCompact: true,
															text: true,
															size: 'xs',
															$$events: {
																click: function (...$$args) {
																	(topAction().onClick ?? undefined)?.apply(this, $$args);
																}
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text();

																$.template_effect(() => $.set_text(text_4, topAction().text));
																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													};

													$.if(node_18, ($$render) => {
														if (topAction().mode === 'copy-tag') $$render(consequent_3); else $$render(alternate, -1);
													});
												}

												$.append($$anchor, fragment_13);
											};

											$.if(node_17, ($$render) => {
												if (topAction() && topAction().text && topAction().show) $$render(consequent_4);
											});
										}

										$.append($$anchor, fragment_10);
									},
									$$slots: { default: true }
								});
							});

							var node_19 = $.sibling(node_14, 2);

							{
								var consequent_5 = ($$anchor) => {
									var fragment_19 = $.comment();
									var node_20 = $.first_child(fragment_19);

									$.component(node_20, () => Layout.Stack, ($$anchor, Layout_Stack_6) => {
										Layout_Stack_6($$anchor, {
											direction: 'row',
											gap: 'xs',
											alignItems: 'center',
											inline: true,
											children: ($$anchor, $$slotProps) => {
												var fragment_20 = $.comment();
												var node_21 = $.first_child(fragment_20);

												$.snippet(node_21, topEndActions);
												$.append($$anchor, fragment_20);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_19);
								};

								$.if(node_19, ($$render) => {
									if (topEndActions()) $$render(consequent_5);
								});
							}

							$.append($$anchor, fragment_9);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_3);
				$.append($$anchor, div_3);
			}
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}