import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import { Menu, Portal } from '@skeletonlabs/skeleton-svelte';
import packageJson from '@skeletonlabs/skeleton/package.json';

var root = $.from_html(`<span> </span> <!>`, 1);
var root_1 = $.from_html(`<a><!> <!></a>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Version($$anchor, $$props) {
	$.push($$props, true);

	const versions = ['v4', 'v3', 'v2', 'v1'];

	Menu($$anchor, {
		class: 'hidden xl:block',
		positioning: { placement: 'bottom-end' },
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			$.component(node, () => Menu.Trigger, ($$anchor, Menu_Trigger) => {
				Menu_Trigger($$anchor, {
					class: 'btn hover:preset-tonal data-[state=open]:preset-tonal px-2 hidden xl:flex',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var span = $.first_child(fragment_2);
						var text = $.only_child(span);
						var node_1 = $.sibling(span, 2);

						ChevronDownIcon(node_1, { class: 'size-4 opacity-50' });
						$.template_effect(() => $.set_text(text, `v${packageJson.version ?? ''}`));
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
														var fragment_6 = root_2();
														var node_6 = $.first_child(fragment_6);

														$.component(node_6, () => Menu.ItemGroupLabel, ($$anchor, Menu_ItemGroupLabel) => {
															Menu_ItemGroupLabel($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_1 = $.text('Previous Versions');

																	$.append($$anchor, text_1);
																},
																$$slots: { default: true }
															});
														});

														var node_7 = $.sibling(node_6, 2);

														$.each(node_7, 16, () => versions, (version) => version, ($$anchor, version) => {
															var fragment_7 = $.comment();
															var node_8 = $.first_child(fragment_7);

															{
																const element = ($$anchor, attributes = $.noop) => {
																	var a = root_1();

																	$.attribute_effect(a, () => ({
																		...attributes(),
																		href: `https://${version}.skeleton.dev`,
																		target: '_blank',
																		rel: 'noopener noreferrer'
																	}));

																	var node_9 = $.child(a);

																	$.component(node_9, () => Menu.ItemText, ($$anchor, Menu_ItemText) => {
																		Menu_ItemText($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_2 = $.text();

																				$.template_effect(() => $.set_text(text_2, `${version ?? ''} Docs`));
																				$.append($$anchor, text_2);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_10 = $.sibling(node_9, 2);

																	ArrowUpRightIcon(node_10, { class: 'size-4 opacity-60' });
																	$.reset(a);
																	$.append($$anchor, a);
																};

																$.component(node_8, () => Menu.Item, ($$anchor, Menu_Item) => {
																	Menu_Item($$anchor, {
																		get value() {
																			return version;
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