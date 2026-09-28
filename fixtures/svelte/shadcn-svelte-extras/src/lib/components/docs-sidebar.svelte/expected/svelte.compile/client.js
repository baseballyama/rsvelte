import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sidebar from '$lib/components/ui/sidebar/index.js';
import { groupedDocs } from '$lib/features/docs/docs';
import { page } from '$app/state';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);
var root = $.from_html(`<span class="bg-brand flex size-2 rounded-full" title="New"></span>`);
var root_1 = $.from_html(`<a><span class="absolute inset-0 flex w-(--sidebar-width) bg-transparent"></span> <!></a>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="from-background via-background/80 to-background/50 sticky -top-1 z-10 h-8 shrink-0 bg-linear-to-b blur-xs"></div> <!> <div class="from-background via-background/80 to-background/50 sticky -bottom-1 z-10 h-16 shrink-0 bg-linear-to-t blur-xs"></div>`, 1);

export default function Docs_sidebar($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const pathname = $.derived(() => page.url.pathname);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Root, ($$anchor, Sidebar_Root) => {
		Sidebar_Root($$anchor, $.spread_props(
			{
				class: 'sticky top-[calc(var(--header-height)+1px)] z-30 hidden h-[calc(100dvh-var(--header-height)-4rem)] overscroll-none bg-transparent lg:flex',
				collapsible: 'none'
			},
			() => restProps,
			{
				get ref() {
					return ref();
				},

				set ref($$value) {
					ref($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					$.component(node_1, () => Sidebar.Content, ($$anchor, Sidebar_Content) => {
						Sidebar_Content($$anchor, {
							class: 'no-scrollbar overflow-x-hidden px-2',
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root_3();
								var node_2 = $.sibling($.first_child(fragment_2), 2);

								$.each(node_2, 17, () => Object.entries(groupedDocs), ([groupTitle, routes]) => groupTitle, ($$anchor, $$item) => {
									var $$array = $.derived(() => $.to_array($.get($$item), 2));
									let groupTitle = () => $.get($$array)[0];
									let routes = () => $.get($$array)[1];
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
										Sidebar_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root_2();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
													Sidebar_GroupLabel($$anchor, {
														class: 'text-muted-foreground font-medium',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text();

															$.template_effect(() => $.set_text(text, groupTitle()));
															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
													Sidebar_GroupContent($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = $.comment();
															var node_6 = $.first_child(fragment_6);

															{
																var consequent_1 = ($$anchor) => {
																	var fragment_7 = $.comment();
																	var node_7 = $.first_child(fragment_7);

																	$.component(node_7, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
																		Sidebar_Menu($$anchor, {
																			class: 'gap-1',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_8 = $.comment();
																				var node_8 = $.first_child(fragment_8);

																				$.each(node_8, 17, routes, (doc) => doc.href, ($$anchor, doc) => {
																					var fragment_9 = $.comment();
																					var node_9 = $.first_child(fragment_9);

																					$.component(node_9, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
																						Sidebar_MenuItem($$anchor, {
																							class: 'w-full',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_10 = $.comment();
																								var node_10 = $.first_child(fragment_10);

																								{
																									const child = ($$anchor, $$arg0) => {
																										let props = () => ($$arg0?.()).props;
																										var a = root_1();

																										$.attribute_effect(a, () => ({ href: $.get(doc).href, ...props() }));

																										var text_1 = $.sibling($.child(a));
																										var node_11 = $.sibling(text_1);

																										{
																											var consequent = ($$anchor) => {
																												var span = root();

																												$.append($$anchor, span);
																											};

																											$.if(node_11, ($$render) => {
																												if ($.get(doc).indicator === 'new') $$render(consequent);
																											});
																										}

																										$.reset(a);
																										$.template_effect(() => $.set_text(text_1, ` ${$.get(doc).title ?? ''} `));
																										$.append($$anchor, a);
																									};

																									let $0 = $.derived(() => $.get(doc).href === $.get(pathname));

																									$.component(node_10, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																										Sidebar_MenuButton($$anchor, {
																											get isActive() {
																												return $.get($0);
																											},
																											class: 'data-[active=true]:bg-accent data-[active=true]:border-accent 3xl:fixed:w-full 3xl:fixed:max-w-48 relative h-[30px] w-fit overflow-clip border border-transparent text-[0.8rem] font-medium after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md',
																											child,
																											$$slots: { child: true }
																										});
																									});
																								}

																								$.append($$anchor, fragment_10);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_9);
																				});

																				$.append($$anchor, fragment_8);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_7);
																};

																$.if(node_6, ($$render) => {
																	if (routes().length) $$render(consequent_1);
																});
															}

															$.append($$anchor, fragment_6);
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
								});

								$.next(2);
								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	});

	$.append($$anchor, fragment);
	$.pop();
}