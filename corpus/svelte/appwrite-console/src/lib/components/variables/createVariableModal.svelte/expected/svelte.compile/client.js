import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, InputPassword } from '$lib/elements/forms';
import { Modal } from '$lib/components';
import { InputText } from '$lib/elements/forms';
import { base } from '$app/paths';
import { Icon, Layout, Selector, Button as PinkButton } from '@appwrite.io/pink-svelte';
import { Link } from '$lib/elements';
import { page } from '$app/state';
import { IconPlus, IconX } from '@appwrite.io/pink-icons-svelte';
import { validateVariables } from '$lib/helpers/variables';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div><!></div>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<span slot="description"> <!>.</span>`);

export default function CreateVariableModal($$anchor, $$props) {
	$.push($$props, true);

	let show = $.prop($$props, 'show', 15, false),
		variables = $.prop($$props, 'variables', 15),
		productLabel = $.prop($$props, 'productLabel', 3, 'site');

	let newVariables = $.state($.proxy([{ key: '', value: '' }]));
	let secret = $.state(false);
	let error = $.state('');

	$.user_effect(() => {
		if (!show()) {
			$.set(newVariables, [{ key: '', value: '' }], true);
			$.set(secret, false);
			$.set(error, '');
		}
	});

	function handleVariable() {
		try {
			if ($.get(secret)) {
				$.set(newVariables, $.get(newVariables).map((variable) => ({ ...variable, secret: true })), true);
			}

			const validationError = validateVariables($.get(newVariables).filter((variable) => variable.key || variable.value));

			if (validationError) {
				throw new Error(validationError);
			}

			const updatedVariables = [...variables()];

			$.get(newVariables).forEach((newVar) => {
				if (!newVar.key) {
					return;
				}

				const existingIndex = updatedVariables.findIndex((v) => v.key === newVar.key);

				if (existingIndex !== -1) {
					updatedVariables[existingIndex] = { ...updatedVariables[existingIndex], ...newVar };
				} else {
					updatedVariables.push(newVar);
				}
			});

			variables(updatedVariables);
			show(false);
		} catch(e) {
			$.set(error, e.message, true);
		}
	}

	function removeVariable(index) {
		if ($.get(newVariables).length === 1) {
			$.set(newVariables, [{ key: '', value: '' }], true);
		} else {
			$.set(newVariables, $.get(newVariables).filter((_, i) => i !== index), true);
		}
	}

	Modal($$anchor, {
		onSubmit: handleVariable,
		title: 'Create variables',
		get show() {
			return show();
		},

		set show($$value) {
			show($$value);
		},

		get error() {
			return $.get(error);
		},

		set error($$value) {
			$.set(error, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					gap: 'xxl',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
							Layout_Stack_1($$anchor, {
								gap: 'xs',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();
									var node_2 = $.first_child(fragment_3);

									$.each(node_2, 17, () => $.get(newVariables), $.index, ($$anchor, pair, i) => {
										var fragment_4 = $.comment();
										var node_3 = $.first_child(fragment_4);

										$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
											Layout_Stack_2($$anchor, {
												direction: 'row',
												gap: 's',
												alignItems: 'flex-end',
												inline: true,
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_4 = $.first_child(fragment_5);

													InputText(node_4, {
														id: 'key',
														label: `${i === 0 ? 'Key' : ''}`,
														placeholder: 'ENTER_KEY',
														autocomplete: false,
														autofocus: true,
														get value() {
															return $.get(pair).key;
														},

														set value($$value) {
															($.get(pair).key = $$value);
														}
													});

													var node_5 = $.sibling(node_4, 2);

													InputPassword(node_5, {
														id: 'value',
														label: `${i === 0 ? 'Value' : ''}`,
														placeholder: 'Enter value',
														minlength: 0,
														get value() {
															return $.get(pair).value;
														},

														set value($$value) {
															($.get(pair).value = $$value);
														}
													});

													var node_6 = $.sibling(node_5, 2);

													{
														let $0 = $.derived(() => $.get(newVariables).length === 1 && !$.get(pair).key && !$.get(pair).value);

														$.component(node_6, () => PinkButton.Button, ($$anchor, PinkButton_Button) => {
															PinkButton_Button($$anchor, {
																icon: true,
																variant: 'secondary',
																type: 'button',
																size: 's',
																get disabled() {
																	return $.get($0);
																},
																onclick: () => removeVariable(i),
																children: ($$anchor, $$slotProps) => {
																	Icon($$anchor, {
																		get icon() {
																			return IconX;
																		}
																	});
																},
																$$slots: { default: true }
															});
														});
													}

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									});

									var div = $.sibling(node_2, 2);
									var node_7 = $.child(div);

									{
										let $0 = $.derived(() => $.get(newVariables).some((pair) => !pair.key));

										Button(node_7, {
											text: true,
											compact: true,
											get disabled() {
												return $.get($0);
											},

											$$events: {
												click: () => $.set(newVariables, [...$.get(newVariables), { key: '', value: '' }], true)
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Add variable');

												$.append($$anchor, text);
											},

											$$slots: {
												default: true,
												start: ($$anchor, $$slotProps) => {
													Icon($$anchor, {
														slot: 'start',
														get icon() {
															return IconPlus;
														}
													});
												}
											}
										});
									}

									$.reset(div);
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_8 = $.sibling(node_1, 2);

						$.component(node_8, () => Selector.Checkbox, ($$anchor, Selector_Checkbox) => {
							Selector_Checkbox($$anchor, {
								size: 's',
								id: 'secret',
								label: 'Secret',
								description: 'If selected, you and your team won\'t be able to read the values after creation.',
								get checked() {
									return $.get(secret);
								},

								set checked($$value) {
									$.set(secret, $$value, true);
								}
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			description: ($$anchor, $$slotProps) => {
				var span = root_3();
				var text_1 = $.child(span);
				var node_9 = $.sibling(text_1);

				{
					let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/settings`);

					Link(node_9, {
						variant: 'muted',
						get href() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('project settings');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				}

				$.next();
				$.reset(span);

				$.template_effect(() => $.set_text(text_1, `Set the environment variables or secret that will be passed to your ${productLabel() ?? ''}. Global
        variables can be set in `));

				$.append($$anchor, span);
			},

			footer: ($$anchor, $$slotProps) => {
				var fragment_8 = root_2();
				var node_10 = $.first_child(fragment_8);

				Button(node_10, {
					secondary: true,
					$$events: { click: () => show(false) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Cancel');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				Button(node_11, {
					submit: true,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Create');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_8);
			}
		}
	});

	$.pop();
}