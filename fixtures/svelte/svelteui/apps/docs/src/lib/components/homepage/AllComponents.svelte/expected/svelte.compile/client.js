import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Group,
	ThemeIcon,
	Text,
	SimpleGrid,
	Box,
	Stack,
	ActionIcon,
	Tooltip,
	Container
} from '@svelteuidev/core';

import { ArrowRight } from 'radix-icons-svelte';
import { components } from '$lib/data';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<a><!></a>`);

export default function AllComponents($$anchor, $$props) {
	// @ts-nocheck
	// prettier-ignore
	// import type { CSS } from '@svelteuidev/core'
	const styles = {
		focusRing: 'auto',
		display: 'block',
		padding: '$xlPX',
		borderRadius: '$md',
		border: `1px solid $gray300`,
		backgroundColor: 'white',
		color: 'black',
		'&:hover': { textDecoration: 'none' }
	};

	SimpleGrid($$anchor, {
		breakpoints: [
			{ minWidth: 800, cols: 1, spacing: 'md' },
			{ minWidth: 1024, cols: 3, spacing: 'sm' }
		],
		spacing: 'lg',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => components, $.index, ($$anchor, item) => {
				Box($$anchor, {
					get href() {
						return $.get(item).link;
					},

					get css() {
						return styles;
					},

					children: ($$anchor, $$slotProps) => {
						Stack($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_1 = $.first_child(fragment_4);

								Group(node_1, {
									children: 2,
									position: 'apart',
									$$slots: {
										default: ($$anchor, $$slotProps) => {
											var fragment_5 = root();
											var node_2 = $.first_child(fragment_5);

											Group(node_2, {
												children: 2,
												$$slots: {
													default: ($$anchor, $$slotProps) => {
														var fragment_6 = root();
														var node_3 = $.first_child(fragment_6);

														{
															let $0 = $.derived(() => ({ backgroundColor: $.get(item).color }));

															ThemeIcon(node_3, {
																size: 34,
																get override() {
																	return $.get($0);
																},

																children: ($$anchor, $$slotProps) => {
																	var fragment_7 = $.comment();
																	var node_4 = $.first_child(fragment_7);

																	$.component(node_4, () => $.get(item).icon, ($$anchor, $$component) => {
																		$$component($$anchor, { size: 20 });
																	});

																	$.append($$anchor, fragment_7);
																},
																$$slots: { default: true }
															});
														}

														var node_5 = $.sibling(node_3, 2);

														Text(node_5, {
															weight: 'extrabold',
															override: { letterSpacing: '$tight' },
															size: 'xl',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text();

																$.template_effect(() => $.set_text(text, $.get(item).title));
																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});

														$.append($$anchor, fragment_6);
													}
												}
											});

											var node_6 = $.sibling(node_2, 2);

											{
												let $0 = $.derived(() => `Go to ${$.get(item).title} docs`);

												Tooltip(node_6, {
													get label() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														var a = root_1();
														var node_7 = $.child(a);

														ActionIcon(node_7, {
															variant: 'light',
															size: 'lg',
															children: ($$anchor, $$slotProps) => {
																ArrowRight($$anchor, { color: 'black' });
															},
															$$slots: { default: true }
														});

														$.reset(a);
														$.template_effect(() => $.set_attribute(a, 'href', $.get(item).link));
														$.append($$anchor, a);
													},
													$$slots: { default: true }
												});
											}

											$.append($$anchor, fragment_5);
										}
									}
								});

								var node_8 = $.sibling(node_1, 2);

								Container(node_8, {
									children: ($$anchor, $$slotProps) => {
										var fragment_10 = $.comment();
										var node_9 = $.first_child(fragment_10);

										{
											var consequent = ($$anchor) => {
												var fragment_11 = $.comment();
												var node_10 = $.first_child(fragment_11);

												$.component(node_10, () => $.get(item).component, ($$anchor, $$component) => {
													$$component($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_12 = $.comment();
															var node_11 = $.first_child(fragment_12);

															$.slot(node_11, $$props, 'default', {}, ($$anchor) => {
																var text_1 = $.text();

																$.template_effect(($0) => $.set_text(text_1, $0), [() => $.get(item).content.valueOf()]);
																$.append($$anchor, text_1);
															});

															$.append($$anchor, fragment_12);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_11);
											};

											var alternate = ($$anchor) => {
												var fragment_14 = $.comment();
												var node_12 = $.first_child(fragment_14);

												$.component(node_12, () => $.get(item).component, ($$anchor, $$component) => {
													$$component($$anchor, {});
												});

												$.append($$anchor, fragment_14);
											};

											$.if(node_9, ($$render) => {
												if ($.get(item)?.content) $$render(consequent); else $$render(alternate, -1);
											});
										}

										$.append($$anchor, fragment_10);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}