import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CardGrid, SvgIcon } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { toLocaleDateTime } from '$lib/helpers/date';
import { Layout, Typography } from '@appwrite.io/pink-svelte';
import { func } from '../store';
import { capitalize } from '$lib/helpers/string';
import { resolveRoute } from '$lib/stores/navigation';
import { page } from '$app/state';

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function ExecuteFunction($$anchor, $$props) {
	$.push($$props, true);

	const $func = () => $.store_get(func, '$func', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const executionUrl = $.derived(() => {
		return resolveRoute('/(console)/project-[region]-[project]/functions/function-[function]/executions/execute-function', page.params);
	});

	CardGrid($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Typography.Title, ($$anchor, Typography_Title) => {
				Typography_Title($$anchor, {
					size: 's',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, $func().name));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			aside: ($$anchor, $$slotProps) => {
				var fragment_3 = $.comment();
				var node_1 = $.first_child(fragment_3);

				$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
					Layout_Stack($$anchor, {
						gap: 'xxxl',
						direction: 'row',
						wrap: 'wrap',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_2();
							var node_2 = $.first_child(fragment_4);

							$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
								Layout_Stack_1($$anchor, {
									gap: 'xxxs',
									inline: true,
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_1();
										var node_3 = $.first_child(fragment_5);

										$.component(node_3, () => Typography.Caption, ($$anchor, Typography_Caption) => {
											Typography_Caption($$anchor, {
												variant: '400',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Runtime');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => Typography.Text, ($$anchor, Typography_Text) => {
											Typography_Text($$anchor, {
												variant: 'm-400',
												color: '--fgcolor-neutral-primary',
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_5 = $.first_child(fragment_6);

													$.component(node_5, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
														Layout_Stack_2($$anchor, {
															direction: 'row',
															gap: 'xxs',
															alignItems: 'center',
															children: ($$anchor, $$slotProps) => {
																var fragment_7 = root();
																var node_6 = $.first_child(fragment_7);

																{
																	let $0 = $.derived(() => $func().runtime.split('-')[0]);

																	SvgIcon(node_6, {
																		size: 16,
																		iconSize: 'small',
																		get name() {
																			return $.get($0);
																		}
																	});
																}

																var text_2 = $.sibling(node_6);

																$.template_effect(($0) => $.set_text(text_2, ` ${$0 ?? ''}`), [() => capitalize($func().runtime)]);
																$.append($$anchor, fragment_7);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							var node_7 = $.sibling(node_2, 2);

							$.component(node_7, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
								Layout_Stack_3($$anchor, {
									gap: 'xxxs',
									inline: true,
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = root_1();
										var node_8 = $.first_child(fragment_8);

										$.component(node_8, () => Typography.Caption, ($$anchor, Typography_Caption_1) => {
											Typography_Caption_1($$anchor, {
												variant: '400',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Updated');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_8, 2);

										$.component(node_9, () => Typography.Text, ($$anchor, Typography_Text_1) => {
											Typography_Text_1($$anchor, {
												variant: 'm-400',
												color: '--fgcolor-neutral-primary',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text();

													$.template_effect(($0) => $.set_text(text_4, $0), [() => toLocaleDateTime($func().$updatedAt)]);
													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							});

							var node_10 = $.sibling(node_7, 2);

							$.component(node_10, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
								Layout_Stack_4($$anchor, {
									gap: 'xxxs',
									inline: true,
									children: ($$anchor, $$slotProps) => {
										var fragment_10 = root_1();
										var node_11 = $.first_child(fragment_10);

										$.component(node_11, () => Typography.Caption, ($$anchor, Typography_Caption_2) => {
											Typography_Caption_2($$anchor, {
												variant: '400',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Created');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										});

										var node_12 = $.sibling(node_11, 2);

										$.component(node_12, () => Typography.Text, ($$anchor, Typography_Text_2) => {
											Typography_Text_2($$anchor, {
												variant: 'm-400',
												color: '--fgcolor-neutral-primary',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text();

													$.template_effect(($0) => $.set_text(text_6, $0), [() => toLocaleDateTime($func().$createdAt)]);
													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_10);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_3);
			},

			actions: ($$anchor, $$slotProps) => {
				Button($$anchor, {
					secondary: true,
					get href() {
						return $.get(executionUrl);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text('Execute');

						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});
			}
		}
	});

	$.pop();
	$$cleanup();
}