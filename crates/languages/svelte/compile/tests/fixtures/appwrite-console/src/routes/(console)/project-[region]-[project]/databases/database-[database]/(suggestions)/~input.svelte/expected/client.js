import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { isCloud } from '$lib/system';
import IconAI from './icon/ai.svelte';
import { slide } from 'svelte/transition';
import { entityColumnSuggestions } from './store';
import { getTerminologies } from '$database/(entity)';
import { randomDataModalState } from '$database/store';
import { Button, InputTextarea, Seekbar } from '$lib/elements/forms';
import { Card, Layout, Selector, Typography } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="suggestions-switch svelte-14wp6wu"><!></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div><!></div>`);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const $entityColumnSuggestions = () => $.store_get(entityColumnSuggestions, '$entityColumnSuggestions', $$stores);
	const $randomDataModalState = () => $.store_get(randomDataModalState, '$randomDataModalState', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const contextAndSeekbar = ($$anchor, $$arg0, $$arg1, $$arg2) => {
		let required = $.derived_safe_equal(() => $.fallback($$arg0?.(), false));
		let contextLabel = $.derived_safe_equal(() => $.fallback($$arg1?.(), undefined));
		let contextType = $.derived_safe_equal(() => $.fallback($$arg2?.(), 'suggestions'));
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			let $0 = $.derived(() => $.get(featureActive) ? 'm' : 'l');

			$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					get gap() {
						return $.get($0);
					},
					style: 'padding-block-end: var(--gap-m);',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_2();
						var node_1 = $.first_child(fragment_1);

						{
							var consequent_1 = ($$anchor) => {
								var fragment_2 = $.comment();
								var node_2 = $.first_child(fragment_2);

								$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
									Layout_Stack_1($$anchor, {
										gap: 's',
										direction: 'row',
										alignItems: 'flex-start',
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root_2();
											var node_3 = $.first_child(fragment_3);

											IconAI(node_3, {});

											var node_4 = $.sibling(node_3, 2);

											$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
												Layout_Stack_2($$anchor, {
													direction: 'column',
													gap: 'none',
													children: ($$anchor, $$slotProps) => {
														var fragment_4 = root();
														var node_5 = $.first_child(fragment_4);

														$.component(node_5, () => Typography.Text, ($$anchor, Typography_Text) => {
															Typography_Text($$anchor, {
																variant: 'm-500',
																color: '--fgcolor-neutral-primary',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text = $.text();

																	$.template_effect(() => $.set_text(text, $.get(title)));
																	$.append($$anchor, text);
																},
																$$slots: { default: true }
															});
														});

														var node_6 = $.sibling(node_5, 2);

														$.component(node_6, () => Typography.Text, ($$anchor, Typography_Text_1) => {
															Typography_Text_1($$anchor, {
																color: '--fgcolor-neutral-secondary',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_1 = $.text();

																	$.template_effect(() => $.set_text(text_1, $.get(subtitle)));
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

											var node_7 = $.sibling(node_4, 2);

											{
												var consequent = ($$anchor) => {
													var div = root_1();
													var node_8 = $.child(div);

													$.component(node_8, () => Selector.Switch, ($$anchor, Selector_Switch) => {
														Selector_Switch($$anchor, {
															id: 'suggestions',
															label: undefined,
															get checked() {
																return $entityColumnSuggestions().enabled;
															},

															set checked($$value) {
																$.store_mutate(entityColumnSuggestions, $.untrack($entityColumnSuggestions).enabled = $$value, $.untrack($entityColumnSuggestions));
															}
														});
													});

													$.reset(div);
													$.append($$anchor, div);
												};

												$.if(node_7, ($$render) => {
													if ($.get(featureActive) && !isModal()) $$render(consequent);
												});
											}

											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_2);
							};

							$.if(node_1, ($$render) => {
								if (!$.get(required)) $$render(consequent_1);
							});
						}

						var node_9 = $.sibling(node_1, 2);

						{
							var consequent_2 = ($$anchor) => {
								var fragment_7 = $.comment();
								var node_10 = $.first_child(fragment_7);

								$.component(node_10, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
									Layout_Stack_3($$anchor, {
										children: ($$anchor, $$slotProps) => {
											Button($$anchor, {
												external: true,
												secondary: true,
												href: 'https://cloud.appwrite.io/register',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Sign up');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_7);
							};

							$.if(node_9, ($$render) => {
								if (!$.get(featureActive)) $$render(consequent_2);
							});
						}

						var node_11 = $.sibling(node_9, 2);

						{
							var consequent_4 = ($$anchor) => {
								var div_1 = root_3();
								let classes;
								var node_12 = $.child(div_1);

								$.component(node_12, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
									Layout_Stack_4($$anchor, {
										gap: 'l',
										children: ($$anchor, $$slotProps) => {
											var fragment_9 = root();
											var node_13 = $.first_child(fragment_9);

											InputTextarea(node_13, {
												id: 'context',
												rows: 3,
												maxlength: 255,
												get label() {
													return $.get(contextLabel);
												},

												get placeholder() {
													return `Optional: Add context to improve ${$.get(contextType) ?? ''}`;
												},

												get value() {
													return $entityColumnSuggestions().context;
												},

												set value($$value) {
													$.store_mutate(entityColumnSuggestions, $.untrack($entityColumnSuggestions).context = $$value, $.untrack($entityColumnSuggestions));
												}
											});

											var node_14 = $.sibling(node_13, 2);

											{
												var consequent_3 = ($$anchor) => {
													var fragment_10 = $.comment();
													var node_15 = $.first_child(fragment_10);

													$.component(node_15, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
														Layout_Stack_5($$anchor, {
															gap: 'xl',
															style: 'padding-inline: var(--space-4, 8px);',
															children: ($$anchor, $$slotProps) => {
																var fragment_11 = root();
																var node_16 = $.first_child(fragment_11);

																$.component(node_16, () => Typography.Text, ($$anchor, Typography_Text_2) => {
																	Typography_Text_2($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_3 = $.text('Select how many random documents to generate for testing.');

																			$.append($$anchor, text_3);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_17 = $.sibling(node_16, 2);

																Seekbar(node_17, {
																	max: 100,
																	extraBlockStart: true,
																	breakpointCount: 5,
																	get value() {
																		return $randomDataModalState().value;
																	},

																	set value($$value) {
																		$.store_mutate(randomDataModalState, $.untrack($randomDataModalState).value = $$value, $.untrack($randomDataModalState));
																	}
																});

																$.append($$anchor, fragment_11);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_10);
												};

												$.if(node_14, ($$render) => {
													if (showSampleCountPicker()) $$render(consequent_3);
												});
											}

											$.append($$anchor, fragment_9);
										},
										$$slots: { default: true }
									});
								});

								$.reset(div_1);
								$.template_effect(() => classes = $.set_class(div_1, 1, 'context-input svelte-14wp6wu', null, classes, { required: $.get(required) }));
								$.transition(3, div_1, () => slide, () => ({ duration: 200 }));
								$.append($$anchor, div_1);
							};

							$.if(node_11, ($$render) => {
								if ($entityColumnSuggestions().enabled && $.get(featureActive)) $$render(consequent_4);
							});
						}

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});
		}

		$.append($$anchor, fragment);
	};

	const isModal = $.prop($$props, 'isModal', 3, false),
		required = $.prop($$props, 'required', 3, false),
		context = $.prop($$props, 'context', 3, 'suggestions'),
		showSampleCountPicker = $.prop($$props, 'showSampleCountPicker', 3, false);

	const featureActive = $.derived(() => isCloud);
	const { terminology } = getTerminologies();
	const type = terminology.type;
	const field = terminology.field.lower;
	const record = terminology.record.lower;
	const entity = terminology.entity.lower.singular;
	const isSchemaless = type === 'documentsdb' || type === 'vectorsdb';

	const title = $.derived(() => {
		switch (type) {
			default:

			case 'legacy':

			case 'tablesdb':
				return $.get(featureActive)
					? `Smart ${field.singular} suggestions`
					: `Smart ${field.singular} suggestions available on Cloud`;

			case 'documentsdb':

			case 'vectorsdb':
				return $.get(featureActive) ? `Sample Data` : `Sample Data available on Cloud`;
		}
	});

	const subtitle = $.derived(() => {
		if ($.get(featureActive)) {
			return isSchemaless
				? `Generate sample ${record.plural} based on your ${entity} name`
				: `Enable AI to suggest useful ${field.plural} based on your ${entity} name`;
		}

		return isSchemaless
			? `Sign up for Cloud to generate sample documents based on your ${entity} name`
			: `Sign up for Cloud to generate ${field.plural} based on your ${entity} name`;
	});

	var fragment_12 = $.comment();
	var node_18 = $.first_child(fragment_12);

	{
		var consequent_5 = ($$anchor) => {
			var fragment_13 = $.comment();
			var node_19 = $.first_child(fragment_13);

			$.component(node_19, () => Card.Base, ($$anchor, Card_Base) => {
				Card_Base($$anchor, {
					variant: 'secondary',
					radius: 's',
					padding: 'xs',
					children: ($$anchor, $$slotProps) => {
						contextAndSeekbar($$anchor, () => false);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_13);
		};

		var alternate = ($$anchor) => {
			contextAndSeekbar($$anchor, () => true, () => 'Context', context);
		};

		$.if(node_18, ($$render) => {
			if (!required()) $$render(consequent_5); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment_12);
	$.pop();
	$$cleanup();
}