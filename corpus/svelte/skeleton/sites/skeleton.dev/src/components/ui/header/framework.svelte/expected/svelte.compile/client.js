import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import { Menu, Portal } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<img class="size-4 grayscale"/> <span class="hidden xl:inline"> </span> <!>`, 1);
var root_1 = $.from_html(`<img class="size-5 grayscale"/>`);
var root_2 = $.from_html(`<a><!> <!></a>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Framework($$anchor, $$props) {
	$.push($$props, true);

	Menu($$anchor, {
		positioning: { placement: 'bottom-end' },
		closeOnSelect: false,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			$.component(node, () => Menu.Trigger, ($$anchor, Menu_Trigger) => {
				Menu_Trigger($$anchor, {
					class: 'btn hover:preset-tonal data-[state=open]:preset-tonal px-2',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var img = $.first_child(fragment_2);
						var span = $.sibling(img, 2);
						var text = $.only_child(span, true);
						var node_1 = $.sibling(span, 2);

						ChevronDownIcon(node_1, { class: 'size-4 opacity-50' });

						$.template_effect(() => {
							$.set_attribute(img, 'src', $$props.activeFramework.data.logo);
							$.set_attribute(img, 'alt', $$props.activeFramework.data.name);
							$.set_text(text, $$props.activeFramework.data.name);
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node, 2);

			Portal(node_2, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_3 = $.first_child(fragment_3);

					$.component(node_3, () => Menu.Positioner, ($$anchor, Menu_Positioner) => {
						Menu_Positioner($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_4 = $.first_child(fragment_4);

								$.component(node_4, () => Menu.Content, ($$anchor, Menu_Content) => {
									Menu_Content($$anchor, {
										class: 'z-50',
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = $.comment();
											var node_5 = $.first_child(fragment_5);

											$.component(node_5, () => Menu.ItemGroup, ($$anchor, Menu_ItemGroup) => {
												Menu_ItemGroup($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = root_3();
														var node_6 = $.first_child(fragment_6);

														$.component(node_6, () => Menu.ItemGroupLabel, ($$anchor, Menu_ItemGroupLabel) => {
															Menu_ItemGroupLabel($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_1 = $.text('Select Framework');

																	$.append($$anchor, text_1);
																},
																$$slots: { default: true }
															});
														});

														var node_7 = $.sibling(node_6, 2);

														$.each(node_7, 16, () => $$props.frameworks, (framework) => framework, ($$anchor, framework) => {
															var fragment_7 = $.comment();
															var node_8 = $.first_child(fragment_7);

															{
																const element = ($$anchor, attributes = $.noop) => {
																	var a = root_2();

																	$.attribute_effect(
																		a,
																		($0) => ({
																			...attributes(),
																			href: $0,
																			'aria-current': $$props.activeFramework.id === framework.id ? 'page' : undefined,
																			'data-astro-history': 'replace'
																		}),
																		[
																			() => $$props.url.pathname.replace($$props.activeFramework.id, framework.id)
																		]
																	);

																	var node_9 = $.child(a);

																	$.component(node_9, () => Menu.ItemText, ($$anchor, Menu_ItemText) => {
																		Menu_ItemText($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_2 = $.text();

																				$.template_effect(() => $.set_text(text_2, framework.data.name));
																				$.append($$anchor, text_2);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_10 = $.sibling(node_9, 2);

																	$.component(node_10, () => Menu.ItemIndicator, ($$anchor, Menu_ItemIndicator) => {
																		Menu_ItemIndicator($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var img_1 = root_1();

																				$.template_effect(() => {
																					$.set_attribute(img_1, 'src', framework.data.logo);
																					$.set_attribute(img_1, 'alt', framework.data.name);
																				});

																				$.append($$anchor, img_1);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.reset(a);
																	$.append($$anchor, a);
																};

																$.component(node_8, () => Menu.Item, ($$anchor, Menu_Item) => {
																	Menu_Item($$anchor, {
																		class: 'aria-[current=page]:preset-filled mt-1',
																		get value() {
																			return framework.id;
																		},
																		element,
																		$$slots: { element: true }
																	});
																});
															}

															$.append($$anchor, fragment_7);
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

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}