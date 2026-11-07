import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sidebar from '$lib/components/ui/sidebar/index.js';
import { page } from '$app/state';
import { resolve } from '$app/paths';
import { getKeyboardShortcut } from '$lib/edra/utils.js';
import { ArrowLeft, Search } from '@lucide/svelte';
import { openSearch } from './docs/Search.svelte';
import { Button } from '../ui/button/index.ts';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);
var root = $.from_html(`<!> <span>Edra</span>`, 1);
var root_1 = $.from_html(`<!> <span>Search Document</span> <span class="ml-auto rounded bg-muted px-1 text-sm"> </span>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<a> </a>`);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function AppSidebar($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const data = {
		navMain: [
			{
				title: 'Getting Started',
				items: [
					{ title: 'Introduction', url: resolve('/docs') },
					{ title: 'Installation', url: resolve('/docs/installation') },
					{ title: 'Configuration', url: resolve('/docs/configuration') },
					{ title: 'Usages', url: resolve('/docs/usages') },
					{
						title: 'Data & Serialization',
						url: resolve('/docs/usages/serialization')
					}
				]
			},

			{
				title: 'Extensions & Plugins',
				items: [
					{
						title: 'Starter Kit',
						url: resolve('/docs/extensions/starter-kit')
					},
					{ title: 'Tables', url: resolve('/docs/extensions/tables') },
					{ title: 'Task List', url: resolve('/docs/extensions/tasks') },
					{
						title: 'Table of Contents',
						url: resolve('/docs/extensions/table-of-contents')
					},

					{
						title: 'Typography & Colors',
						url: resolve('/docs/extensions/typography-and-colors')
					},

					{
						title: 'Mathematics',
						url: resolve('/docs/extensions/mathematics')
					},
					{ title: 'Markdown', url: resolve('/docs/extensions/markdown') },
					{
						title: 'Media & Mermaid',
						url: resolve('/docs/extensions/media-and-mermaid')
					},
					{ title: 'Callouts', url: resolve('/docs/extensions/callout') },
					{
						title: 'Drag Handle',
						url: resolve('/docs/extensions/drag-handle')
					},

					{
						title: 'Codeblock',
						url: resolve('/docs/extensions/code-block')
					},
					{ title: 'AI Assistant', url: resolve('/docs/extensions/ai') },
					{
						title: 'Slash Command',
						url: resolve('/docs/extensions/slash-command')
					},

					{
						title: 'Realtime Collaboration',
						url: resolve('/docs/collaboration')
					}
				]
			},

			{
				title: 'Customization',
				items: [
					{
						title: 'Customizing Extensions',
						url: resolve('/docs/customization')
					},

					{
						title: 'Typography & Styling',
						url: resolve('/docs/customization/styling')
					},

					{
						title: 'Localization & Strings',
						url: resolve('/docs/customization/localization')
					}
				]
			}
		]
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Root, ($$anchor, Sidebar_Root) => {
		Sidebar_Root($$anchor, $.spread_props(() => restProps, {
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_4();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.Header, ($$anchor, Sidebar_Header) => {
					Sidebar_Header($$anchor, {
						class: 'mt-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var node_2 = $.first_child(fragment_2);

							{
								let $0 = $.derived(() => resolve('/'));

								Button(node_2, {
									variant: 'ghost',
									class: 'nodefault justify-start',
									get href() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_3 = $.first_child(fragment_3);

										ArrowLeft(node_3, {});
										$.next(2);
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							}

							var node_4 = $.sibling(node_2, 2);

							$.component(node_4, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
								Sidebar_Menu($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_5 = $.first_child(fragment_4);

										$.component(node_5, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
											Sidebar_MenuItem($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = $.comment();
													var node_6 = $.first_child(fragment_5);

													$.component(node_6, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
														Sidebar_MenuButton($$anchor, {
															class: 'rounded-lg border',
															get onclick() {
																return openSearch;
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_6 = root_1();
																var node_7 = $.first_child(fragment_6);

																Search(node_7, {});

																var span = $.sibling(node_7, 4);
																var text = $.only_child(span, true);

																$.template_effect(($0) => $.set_text(text, $0), [() => getKeyboardShortcut('K', true)]);
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

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_8 = $.sibling(node_1, 2);

				$.component(node_8, () => Sidebar.Content, ($$anchor, Sidebar_Content) => {
					Sidebar_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = $.comment();
							var node_9 = $.first_child(fragment_7);

							$.each(node_9, 17, () => data.navMain, (group) => group.title, ($$anchor, group) => {
								var fragment_8 = $.comment();
								var node_10 = $.first_child(fragment_8);

								$.component(node_10, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
									Sidebar_Group($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_9 = root_2();
											var node_11 = $.first_child(fragment_9);

											$.component(node_11, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
												Sidebar_GroupLabel($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text();

														$.template_effect(() => $.set_text(text_1, $.get(group).title));
														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											});

											var node_12 = $.sibling(node_11, 2);

											$.component(node_12, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
												Sidebar_GroupContent($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_11 = $.comment();
														var node_13 = $.first_child(fragment_11);

														$.component(node_13, () => Sidebar.Menu, ($$anchor, Sidebar_Menu_1) => {
															Sidebar_Menu_1($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_12 = $.comment();
																	var node_14 = $.first_child(fragment_12);

																	$.each(node_14, 17, () => $.get(group).items, (item) => item.title, ($$anchor, item) => {
																		var fragment_13 = $.comment();
																		var node_15 = $.first_child(fragment_13);

																		$.component(node_15, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_1) => {
																			Sidebar_MenuItem_1($$anchor, {
																				class: 'my-0.5',
																				children: ($$anchor, $$slotProps) => {
																					const isActive = $.derived(() => page.url.pathname === $.get(item).url);
																					var fragment_14 = $.comment();
																					var node_16 = $.first_child(fragment_14);

																					{
																						const child = ($$anchor, $$arg0) => {
																							let props = () => ($$arg0?.()).props;
																							var a = root_3();

																							$.attribute_effect(a, () => ({ href: $.get(item).url, ...props() }));

																							var text_2 = $.only_child(a, true);

																							$.template_effect(() => $.set_text(text_2, $.get(item).title));
																							$.append($$anchor, a);
																						};

																						$.component(node_16, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_1) => {
																							Sidebar_MenuButton_1($$anchor, {
																								get isActive() {
																									return $.get(isActive);
																								},
																								child,
																								$$slots: { child: true }
																							});
																						});
																					}

																					$.append($$anchor, fragment_14);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_13);
																	});

																	$.append($$anchor, fragment_12);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_11);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_9);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_8);
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});
				});

				var node_17 = $.sibling(node_8, 2);

				$.component(node_17, () => Sidebar.Rail, ($$anchor, Sidebar_Rail) => {
					Sidebar_Rail($$anchor, {});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	$.append($$anchor, fragment);
	$.pop();
}