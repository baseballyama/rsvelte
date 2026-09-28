import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { isCloud } from '$lib/system';
import { getChangePlanUrl } from '$lib/stores/billing';
import { currentPlan } from '$lib/stores/organization';

import {
	ActionMenu,
	Popover,
	Layout,
	Selector,
	Tag,
	Tooltip,
	Typography,
	Link
} from '@appwrite.io/pink-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<button type="button"><!></button> <!>`, 1);
var root_2 = $.from_html(`Available on Pro plan. <!> to enable encrypted columns.`, 1);
var root_3 = $.from_html(`<div><!></div>`);

export default function EncryptCheckbox($$anchor, $$props) {
	$.push($$props, true);

	const $currentPlan = () => $.store_get(currentPlan, '$currentPlan', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let encrypt = $.prop($$props, 'encrypt', 15, false),
		editing = $.prop($$props, 'editing', 3, false),
		disabled = $.prop($$props, 'disabled', 3, false),
		id = $.prop($$props, 'id', 3, 'encrypt');

	const organizationId = page.data?.organization?.$id ?? page.data?.project?.teamId;
	const supportsEncryption = $.derived(() => isCloud ? $currentPlan()?.databasesAllowEncrypt : true);

	{
		let $0 = $.derived(() => !(editing() || disabled()));

		Tooltip($$anchor, {
			get disabled() {
				return $.get($0);
			},
			maxWidth: '275px',
			placement: 'bottom-start',
			children: ($$anchor, $$slotProps) => {
				var div = root_3();
				let classes;
				var node = $.child(div);

				$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
					Layout_Stack($$anchor, {
						inline: true,
						gap: 's',
						alignItems: 'flex-start',
						direction: 'row',
						children: ($$anchor, $$slotProps) => {
							Popover($$anchor, {
								placement: 'bottom-start',
								children: $.invalid_default_snippet,
								$$slots: {
									default: ($$anchor, $$slotProps) => {
										const toggle = $.derived(() => $$slotProps.toggle);
										var fragment_2 = root();
										var node_1 = $.first_child(fragment_2);

										{
											let $0 = $.derived(() => !$.get(supportsEncryption) || editing() || disabled());

											$.component(node_1, () => Selector.Checkbox, ($$anchor, Selector_Checkbox) => {
												Selector_Checkbox($$anchor, {
													size: 's',
													get id() {
														return id();
													},

													get disabled() {
														return $.get($0);
													},

													get checked() {
														return encrypt();
													},

													set checked($$value) {
														encrypt($$value);
													}
												});
											});
										}

										var node_2 = $.sibling(node_1, 2);

										$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
											Layout_Stack_1($$anchor, {
												gap: 'xxs',
												direction: 'column',
												children: ($$anchor, $$slotProps) => {
													var fragment_3 = root_1();
													var button = $.first_child(fragment_3);
													let classes_1;
													var node_3 = $.child(button);

													$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
														Layout_Stack_2($$anchor, {
															inline: true,
															gap: 'xxs',
															direction: 'row',
															alignItems: 'center',
															children: ($$anchor, $$slotProps) => {
																var fragment_4 = root();
																var node_4 = $.first_child(fragment_4);

																$.component(node_4, () => Typography.Text, ($$anchor, Typography_Text) => {
																	Typography_Text($$anchor, {
																		variant: 'm-500',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text = $.text('Encrypted');

																			$.append($$anchor, text);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_5 = $.sibling(node_4, 2);

																{
																	var consequent = ($$anchor) => {
																		Tag($$anchor, {
																			variant: 'default',
																			size: 'xs',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_1 = $.text('Pro');

																				$.append($$anchor, text_1);
																			},
																			$$slots: { default: true }
																		});
																	};

																	$.if(node_5, ($$render) => {
																		if (!$.get(supportsEncryption)) $$render(consequent);
																	});
																}

																$.append($$anchor, fragment_4);
															},
															$$slots: { default: true }
														});
													});

													$.reset(button);

													var node_6 = $.sibling(button, 2);

													$.component(node_6, () => Typography.Text, ($$anchor, Typography_Text_1) => {
														Typography_Text_1($$anchor, {
															color: '--fgcolor-neutral-tertiary',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Protect column against data leaks for best privacy compliance. Encrypted\n                        columns cannot be queried.');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													$.template_effect(() => {
														button.disabled = editing() || disabled();

														classes_1 = $.set_class(button, 1, 'svelte-pdauwr', null, classes_1, {
															'cursor-pointer': !(editing() || disabled()),
															'cursor-not-allowed': editing() || disabled()
														});
													});

													$.delegated('click', button, (e) => {
														if (!$.get(supportsEncryption)) {
															$.get(toggle)(e);
														} else {
															encrypt(!encrypt());
														}
													});

													$.append($$anchor, fragment_3);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_2);
									},

									tooltip: ($$anchor, $$slotProps) => {
										var fragment_6 = $.comment();
										var node_7 = $.first_child(fragment_6);

										$.component(node_7, () => ActionMenu.Root, ($$anchor, ActionMenu_Root) => {
											ActionMenu_Root($$anchor, {
												width: '180px',
												slot: 'tooltip',
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = $.comment();
													var node_8 = $.first_child(fragment_7);

													$.component(node_8, () => Typography.Text, ($$anchor, Typography_Text_2) => {
														Typography_Text_2($$anchor, {
															variant: 'm-500',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var fragment_8 = root_2();
																var node_9 = $.sibling($.first_child(fragment_8));

																{
																	let $0 = $.derived(() => getChangePlanUrl(organizationId));

																	$.component(node_9, () => Link.Anchor, ($$anchor, Link_Anchor) => {
																		Link_Anchor($$anchor, {
																			get href() {
																				return $.get($0);
																			},

																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_3 = $.text('Upgrade');

																				$.append($$anchor, text_3);
																			},
																			$$slots: { default: true }
																		});
																	});
																}

																$.next();
																$.append($$anchor, fragment_8);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_6);
									}
								}
							});
						},
						$$slots: { default: true }
					});
				});

				$.reset(div);

				$.template_effect(() => classes = $.set_class(div, 1, 'popover-holder svelte-pdauwr', null, classes, {
					'cursor-not-allowed': editing() || disabled(),
					'disabled-checkbox': !$.get(supportsEncryption) || editing() || disabled()
				}));

				$.append($$anchor, div);
			},

			$$slots: {
				default: true,
				tooltip: ($$anchor, $$slotProps) => {
					var text_4 = $.text('Encryption can only be set when creating the column.');

					$.append($$anchor, text_4);
				}
			}
		});
	}

	$.pop();
	$$cleanup();
}

$.delegate(['click']);