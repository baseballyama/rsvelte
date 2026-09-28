import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckIcon from '@lucide/svelte/icons/check';
import { Menu, Portal } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Option($$anchor) {
	const sortOptions = [
		{ value: 'newest', label: 'Newest' },
		{ value: 'popular', label: 'Most Popular' },
		{ value: 'rating', label: 'Highest Rated' }
	];

	const filterOptions = [
		{ value: 'free-shipping', label: 'Free Shipping' },
		{ value: 'in-stock', label: 'In Stock' },
		{ value: 'on-sale', label: 'On Sale' }
	];

	let sort = $.state('newest');
	let filters = $.state($.proxy(['free-shipping', 'in-stock']));

	Menu($$anchor, {
		closeOnSelect: false,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Menu.Trigger, ($$anchor, Menu_Trigger) => {
				Menu_Trigger($$anchor, {
					class: 'btn preset-filled',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Open Menu');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			Portal(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => Menu.Positioner, ($$anchor, Menu_Positioner) => {
						Menu_Positioner($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_3 = $.first_child(fragment_3);

								$.component(node_3, () => Menu.Content, ($$anchor, Menu_Content) => {
									Menu_Content($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root_1();
											var node_4 = $.first_child(fragment_4);

											$.each(node_4, 16, () => sortOptions, (item) => item, ($$anchor, item) => {
												var fragment_5 = $.comment();
												var node_5 = $.first_child(fragment_5);

												{
													let $0 = $.derived(() => $.get(sort) === item.value);

													$.component(node_5, () => Menu.OptionItem, ($$anchor, Menu_OptionItem) => {
														Menu_OptionItem($$anchor, {
															type: 'radio',
															get checked() {
																return $.get($0);
															},
															onCheckedChange: (checked) => $.set(sort, checked ? item.value : '', true),
															get value() {
																return item.value;
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_6 = root();
																var node_6 = $.first_child(fragment_6);

																$.component(node_6, () => Menu.ItemText, ($$anchor, Menu_ItemText) => {
																	Menu_ItemText($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_1 = $.text();

																			$.template_effect(() => $.set_text(text_1, item.label));
																			$.append($$anchor, text_1);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_7 = $.sibling(node_6, 2);

																$.component(node_7, () => Menu.ItemIndicator, ($$anchor, Menu_ItemIndicator) => {
																	Menu_ItemIndicator($$anchor, {
																		class: 'hidden data-[state=checked]:block',
																		children: ($$anchor, $$slotProps) => {
																			CheckIcon($$anchor, { class: 'size-4' });
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_6);
															},
															$$slots: { default: true }
														});
													});
												}

												$.append($$anchor, fragment_5);
											});

											var node_8 = $.sibling(node_4, 2);

											$.component(node_8, () => Menu.Separator, ($$anchor, Menu_Separator) => {
												Menu_Separator($$anchor, {});
											});

											var node_9 = $.sibling(node_8, 2);

											$.each(node_9, 16, () => filterOptions, (item) => item, ($$anchor, item) => {
												var fragment_9 = $.comment();
												var node_10 = $.first_child(fragment_9);

												{
													let $0 = $.derived(() => $.get(filters).includes(item.value));

													$.component(node_10, () => Menu.OptionItem, ($$anchor, Menu_OptionItem_1) => {
														Menu_OptionItem_1($$anchor, {
															type: 'checkbox',
															get checked() {
																return $.get($0);
															},

															onCheckedChange: (checked) => $.set(
																filters,
																checked
																	? [...$.get(filters), item.value]
																	: $.get(filters).filter((x) => x !== item.value),
																true
															),

															get value() {
																return item.value;
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_10 = root();
																var node_11 = $.first_child(fragment_10);

																$.component(node_11, () => Menu.ItemText, ($$anchor, Menu_ItemText_1) => {
																	Menu_ItemText_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_2 = $.text();

																			$.template_effect(() => $.set_text(text_2, item.label));
																			$.append($$anchor, text_2);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_12 = $.sibling(node_11, 2);

																$.component(node_12, () => Menu.ItemIndicator, ($$anchor, Menu_ItemIndicator_1) => {
																	Menu_ItemIndicator_1($$anchor, {
																		class: 'hidden data-[state=checked]:block',
																		children: ($$anchor, $$slotProps) => {
																			CheckIcon($$anchor, { class: 'size-4' });
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_10);
															},
															$$slots: { default: true }
														});
													});
												}

												$.append($$anchor, fragment_9);
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}