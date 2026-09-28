import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { InputId } from '$lib/elements/forms';
import { InputProjectId } from '$lib/elements/forms';
import Button from '$lib/elements/forms/button.svelte';
import { IconX } from '@appwrite.io/pink-icons-svelte';
import { Click, trackEvent } from '$lib/actions/analytics';
import { Card, Divider, Icon, Layout, Typography } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <span style="margin-left: calc(-1* var(--space-7));margin-right: calc(-1* var(--space-7));width:auto;"><!></span> <!>`, 1);
var root_2 = $.from_html(`<svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper>`, 1);

export default function CustomId($$anchor, $$props) {
	$.push($$props, true);

	let show = $.prop($$props, 'show', 15, false),
		id = $.prop($$props, 'id', 15, null),
		autofocus = $.prop($$props, 'autofocus', 3, true),
		isProject = $.prop($$props, 'isProject', 3, false),
		required = $.prop($$props, 'required', 3, true),
		syncFrom = $.prop($$props, 'syncFrom', 3, undefined),
		disabled = $.prop($$props, 'disabled', 3, false);

	let touchedId = $.state(false);

	function toIdFormat(str) {
		return str.toLowerCase().replace(/[^a-z0-9\-_. ]+/g, '').replace(/ /g, '_').replace(/^-+/, '').replace(/\.+$/, '').replace(/_{2,}/g, '_').slice(0, 36); // max length
	}

	function handleInput() {
		if (!$.get(touchedId)) {
			$.set(touchedId, true);
		}
	}

	$.user_effect(() => {
		if (!show()) {
			id(null);
		}

		if (id() !== null && !id().length) {
			id(null);
		}
	});

	$.user_effect(() => {
		if (show()) {
			trackEvent(Click.ShowCustomIdClick);
		}
	});

	$.user_effect(() => {
		if (syncFrom() && !$.get(touchedId)) {
			const newId = toIdFormat(syncFrom());

			if (id() !== newId) {
				id(newId);
			}
		}
	});

	$.user_effect(() => {
		if (!show()) {
			$.set(touchedId, false);
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = root_2();
			var node_1 = $.first_child(fragment_1);

			{
				$.css_props(node_1, () => ({ '--input-background-color': 'var(--bgcolor-neutral-primary)' }));

				$.component(node_1.lastChild, () => Card.Base, ($$anchor, Card_Base) => {
					Card_Base($$anchor, {
						variant: 'secondary',
						padding: 's',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack) => {
								Layout_Stack($$anchor, {
									gap: 'xl',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_1();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
											Layout_Stack_1($$anchor, {
												gap: 's',
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var node_4 = $.first_child(fragment_4);

													$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
														Layout_Stack_2($$anchor, {
															direction: 'row',
															justifyContent: 'space-between',
															alignContent: 'center',
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = root();
																var node_5 = $.first_child(fragment_5);

																$.component(node_5, () => Typography.Text, ($$anchor, Typography_Text) => {
																	Typography_Text($$anchor, {
																		variant: 'm-600',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text = $.text();

																			$.template_effect(() => $.set_text(text, `${$$props.name ?? ''} ID`));
																			$.append($$anchor, text);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_6 = $.sibling(node_5, 2);

																Button(node_6, {
																	extraCompact: true,
																	$$events: { click: () => show(false) },
																	children: ($$anchor, $$slotProps) => {
																		Icon($$anchor, {
																			get icon() {
																				return IconX;
																			},
																			size: 's'
																		});
																	},
																	$$slots: { default: true }
																});

																$.append($$anchor, fragment_5);
															},
															$$slots: { default: true }
														});
													});

													var node_7 = $.sibling(node_4, 2);

													$.component(node_7, () => Typography.Text, ($$anchor, Typography_Text_1) => {
														Typography_Text_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text();

																$.template_effect(() => $.set_text(text_1, `Enter a custom ${$$props.name ?? ''} ID. Leave blank for a randomly generated one.`));
																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										var span = $.sibling(node_3, 2);
										var node_8 = $.child(span);

										Divider(node_8, {});
										$.reset(span);

										var node_9 = $.sibling(span, 2);

										{
											var consequent = ($$anchor) => {
												InputProjectId($$anchor, {
													get disabled() {
														return disabled();
													},

													get autofocus() {
														return autofocus();
													},

													get value() {
														return id();
													},

													set value($$value) {
														id($$value);
													},
													$$events: { input: handleInput }
												});
											};

											var alternate = ($$anchor) => {
												InputId($$anchor, {
													get disabled() {
														return disabled();
													},

													get required() {
														return required();
													},

													get autofocus() {
														return autofocus();
													},

													get value() {
														return id();
													},

													set value($$value) {
														id($$value);
													},
													$$events: { input: handleInput }
												});
											};

											$.if(node_9, ($$render) => {
												if (isProject()) $$render(consequent); else $$render(alternate, -1);
											});
										}

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.reset(node_1);
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (show()) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}