import 'svelte/internal/disclose-version';
import ArchiveXIcon from "@lucide/svelte/icons/archive-x";
import FileIcon from "@lucide/svelte/icons/file";
import InboxIcon from "@lucide/svelte/icons/inbox";
import SendIcon from "@lucide/svelte/icons/send";
import Trash2Icon from "@lucide/svelte/icons/trash-2";
import * as $ from 'svelte/internal/client';
import CommandIcon from "@lucide/svelte/icons/command";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import { useSidebar } from "$lib/registry/ui/sidebar/context.svelte.js";
import { Switch } from "$lib/registry/ui/switch/index.js";
import NavUser from "./nav-user.svelte";

const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg"
	},
	navMain: [
		{ title: "Inbox", url: "#", icon: InboxIcon, isActive: true },
		{ title: "Drafts", url: "#", icon: FileIcon, isActive: false },
		{ title: "Sent", url: "#", icon: SendIcon, isActive: false },
		{ title: "Junk", url: "#", icon: ArchiveXIcon, isActive: false },
		{ title: "Trash", url: "#", icon: Trash2Icon, isActive: false }
	],
	mails: [
		{
			name: "William Smith",
			email: "williamsmith@example.com",
			subject: "Meeting Tomorrow",
			date: "09:34 AM",
			teaser: "Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates."
		},

		{
			name: "Alice Smith",
			email: "alicesmith@example.com",
			subject: "Re: Project Update",
			date: "Yesterday",
			teaser: "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps."
		},

		{
			name: "Bob Johnson",
			email: "bobjohnson@example.com",
			subject: "Weekend Plans",
			date: "2 days ago",
			teaser: "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?"
		},

		{
			name: "Emily Davis",
			email: "emilydavis@example.com",
			subject: "Re: Question about Budget",
			date: "2 days ago",
			teaser: "I've reviewed the budget numbers you sent over.\nCan we set up a quick call to discuss some potential adjustments?"
		},

		{
			name: "Michael Wilson",
			email: "michaelwilson@example.com",
			subject: "Important Announcement",
			date: "1 week ago",
			teaser: "Please join us for an all-hands meeting this Friday at 3 PM.\nWe have some exciting news to share about the company's future."
		},

		{
			name: "Sarah Brown",
			email: "sarahbrown@example.com",
			subject: "Re: Feedback on Proposal",
			date: "1 week ago",
			teaser: "Thank you for sending over the proposal. I've reviewed it and have some thoughts.\nCould we schedule a meeting to discuss my feedback in detail?"
		},

		{
			name: "David Lee",
			email: "davidlee@example.com",
			subject: "New Project Idea",
			date: "1 week ago",
			teaser: "I've been brainstorming and came up with an interesting project concept.\nDo you have time this week to discuss its potential impact and feasibility?"
		},

		{
			name: "Olivia Wilson",
			email: "oliviawilson@example.com",
			subject: "Vacation Plans",
			date: "1 week ago",
			teaser: "Just a heads up that I'll be taking a two-week vacation next month.\nI'll make sure all my projects are up to date before I leave."
		},

		{
			name: "James Martin",
			email: "jamesmartin@example.com",
			subject: "Re: Conference Registration",
			date: "1 week ago",
			teaser: "I've completed the registration for the upcoming tech conference.\nLet me know if you need any additional information from my end."
		},

		{
			name: "Sophia White",
			email: "sophiawhite@example.com",
			subject: "Team Dinner",
			date: "1 week ago",
			teaser: "To celebrate our recent project success, I'd like to organize a team dinner.\nAre you available next Friday evening? Please let me know your preferences."
		}
	]
};

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);
var root = $.from_html(`<a><div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><!></div> <div class="grid flex-1 text-start text-sm leading-tight"><span class="truncate font-medium">Acme Inc</span> <span class="truncate text-xs">Enterprise</span></div></a>`);
var root_1 = $.from_html(`<!> <span> </span>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<span>Unreads</span> <!>`, 1);
var root_4 = $.from_html(`<div class="flex w-full items-center justify-between"><div class="text-base font-medium text-foreground"> </div> <!></div> <!>`, 1);
var root_5 = $.from_html(`<a href="##" class="flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"><div class="flex w-full items-center gap-2"><span> </span> <span class="ms-auto text-xs"> </span></div> <span class="font-medium"> </span> <span class="line-clamp-2 w-[260px] text-xs whitespace-break-spaces"> </span></a>`);
var root_6 = $.from_html(`<!> <!>`, 1);
var root_7 = $.from_html(`<!>  <!>`, 1);

export default function App_sidebar($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	let activeItem = $.state($.proxy(data.navMain[0]));
	let mails = $.state($.proxy(data.mails));
	const sidebar = useSidebar();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Root, ($$anchor, Sidebar_Root) => {
		Sidebar_Root($$anchor, $.spread_props(
			{
				collapsible: 'icon',
				class: 'overflow-hidden [&>[data-sidebar=sidebar]]:flex-row'
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
					var fragment_1 = root_7();
					var node_1 = $.first_child(fragment_1);

					$.component(node_1, () => Sidebar.Root, ($$anchor, Sidebar_Root_1) => {
						Sidebar_Root_1($$anchor, {
							collapsible: 'none',
							class: '!w-[calc(var(--sidebar-width-icon)_+_1px)] border-e',
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root_2();
								var node_2 = $.first_child(fragment_2);

								$.component(node_2, () => Sidebar.Header, ($$anchor, Sidebar_Header) => {
									Sidebar_Header($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = $.comment();
											var node_3 = $.first_child(fragment_3);

											$.component(node_3, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
												Sidebar_Menu($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_4 = $.comment();
														var node_4 = $.first_child(fragment_4);

														$.component(node_4, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
															Sidebar_MenuItem($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_5 = $.comment();
																	var node_5 = $.first_child(fragment_5);

																	{
																		const child = ($$anchor, $$arg0) => {
																			let props = () => ($$arg0?.()).props;
																			var a = root();

																			$.attribute_effect(a, () => ({ href: '##', ...props() }));

																			var div = $.child(a);
																			var node_6 = $.child(div);

																			CommandIcon(node_6, { class: 'size-4' });
																			$.reset(div);
																			$.next(2);
																			$.reset(a);
																			$.append($$anchor, a);
																		};

																		$.component(node_5, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																			Sidebar_MenuButton($$anchor, {
																				size: 'lg',
																				class: 'md:h-8 md:p-0',
																				child,
																				$$slots: { child: true }
																			});
																		});
																	}

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
								});

								var node_7 = $.sibling(node_2, 2);

								$.component(node_7, () => Sidebar.Content, ($$anchor, Sidebar_Content) => {
									Sidebar_Content($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = $.comment();
											var node_8 = $.first_child(fragment_6);

											$.component(node_8, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
												Sidebar_Group($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_7 = $.comment();
														var node_9 = $.first_child(fragment_7);

														$.component(node_9, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
															Sidebar_GroupContent($$anchor, {
																class: 'px-1.5 md:px-0',
																children: ($$anchor, $$slotProps) => {
																	var fragment_8 = $.comment();
																	var node_10 = $.first_child(fragment_8);

																	$.component(node_10, () => Sidebar.Menu, ($$anchor, Sidebar_Menu_1) => {
																		Sidebar_Menu_1($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_9 = $.comment();
																				var node_11 = $.first_child(fragment_9);

																				$.each(node_11, 17, () => data.navMain, (item) => item.title, ($$anchor, item) => {
																					var fragment_10 = $.comment();
																					var node_12 = $.first_child(fragment_10);

																					$.component(node_12, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_1) => {
																						Sidebar_MenuItem_1($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_11 = $.comment();
																								var node_13 = $.first_child(fragment_11);

																								{
																									const tooltipContent = ($$anchor) => {
																										$.next();

																										var text = $.text();

																										$.template_effect(() => $.set_text(text, $.get(item).title));
																										$.append($$anchor, text);
																									};

																									let $0 = $.derived(() => $.get(activeItem).title === $.get(item).title);

																									$.component(node_13, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_1) => {
																										Sidebar_MenuButton_1($$anchor, {
																											tooltipContentProps: { hidden: false },
																											onclick: () => {
																												$.set(activeItem, $.get(item), true);

																												const mail = data.mails.sort(() => Math.random() - 0.5);

																												$.set(mails, mail.slice(0, Math.max(5, Math.floor(Math.random() * 10) + 1)), true);
																												sidebar.setOpen(true);
																											},

																											get isActive() {
																												return $.get($0);
																											},
																											class: 'px-2.5 md:px-2',
																											tooltipContent,
																											children: ($$anchor, $$slotProps) => {
																												var fragment_13 = root_1();
																												var node_14 = $.first_child(fragment_13);

																												$.component(node_14, () => $.get(item).icon, ($$anchor, item_icon) => {
																													item_icon($$anchor, {});
																												});

																												var span = $.sibling(node_14, 2);
																												var text_1 = $.only_child(span, true);

																												$.template_effect(() => $.set_text(text_1, $.get(item).title));
																												$.append($$anchor, fragment_13);
																											},
																											$$slots: { tooltipContent: true, default: true }
																										});
																									});
																								}

																								$.append($$anchor, fragment_11);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_10);
																				});

																				$.append($$anchor, fragment_9);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_8);
																},
																$$slots: { default: true }
															});
														});

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

								var node_15 = $.sibling(node_7, 2);

								$.component(node_15, () => Sidebar.Footer, ($$anchor, Sidebar_Footer) => {
									Sidebar_Footer($$anchor, {
										children: ($$anchor, $$slotProps) => {
											NavUser($$anchor, {
												get user() {
													return data.user;
												}
											});
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});

					var node_16 = $.sibling(node_1, 2);

					$.component(node_16, () => Sidebar.Root, ($$anchor, Sidebar_Root_2) => {
						Sidebar_Root_2($$anchor, {
							collapsible: 'none',
							class: 'hidden flex-1 md:flex',
							children: ($$anchor, $$slotProps) => {
								var fragment_15 = root_6();
								var node_17 = $.first_child(fragment_15);

								$.component(node_17, () => Sidebar.Header, ($$anchor, Sidebar_Header_1) => {
									Sidebar_Header_1($$anchor, {
										class: 'gap-3.5 border-b p-4',
										children: ($$anchor, $$slotProps) => {
											var fragment_16 = root_4();
											var div_1 = $.first_child(fragment_16);
											var div_2 = $.child(div_1);
											var text_2 = $.only_child(div_2, true);
											var node_18 = $.sibling(div_2, 2);

											Label(node_18, {
												class: 'flex items-center gap-2 text-sm',
												children: ($$anchor, $$slotProps) => {
													var fragment_17 = root_3();
													var node_19 = $.sibling($.first_child(fragment_17), 2);

													Switch(node_19, { class: 'shadow-none' });
													$.append($$anchor, fragment_17);
												},
												$$slots: { default: true }
											});

											$.reset(div_1);

											var node_20 = $.sibling(div_1, 2);

											$.component(node_20, () => Sidebar.Input, ($$anchor, Sidebar_Input) => {
												Sidebar_Input($$anchor, { placeholder: 'Type to search...' });
											});

											$.template_effect(() => $.set_text(text_2, $.get(activeItem).title));
											$.append($$anchor, fragment_16);
										},
										$$slots: { default: true }
									});
								});

								var node_21 = $.sibling(node_17, 2);

								$.component(node_21, () => Sidebar.Content, ($$anchor, Sidebar_Content_1) => {
									Sidebar_Content_1($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_18 = $.comment();
											var node_22 = $.first_child(fragment_18);

											$.component(node_22, () => Sidebar.Group, ($$anchor, Sidebar_Group_1) => {
												Sidebar_Group_1($$anchor, {
													class: 'px-0',
													children: ($$anchor, $$slotProps) => {
														var fragment_19 = $.comment();
														var node_23 = $.first_child(fragment_19);

														$.component(node_23, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent_1) => {
															Sidebar_GroupContent_1($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_20 = $.comment();
																	var node_24 = $.first_child(fragment_20);

																	$.each(node_24, 17, () => $.get(mails), (mail) => mail.email, ($$anchor, mail) => {
																		var a_1 = root_5();
																		var div_3 = $.child(a_1);
																		var span_1 = $.child(div_3);
																		var text_3 = $.only_child(span_1, true);
																		var span_2 = $.sibling(span_1, 2);
																		var text_4 = $.only_child(span_2, true);

																		$.reset(div_3);

																		var span_3 = $.sibling(div_3, 2);
																		var text_5 = $.only_child(span_3, true);
																		var span_4 = $.sibling(span_3, 2);
																		var text_6 = $.only_child(span_4, true);

																		$.reset(a_1);

																		$.template_effect(() => {
																			$.set_text(text_3, $.get(mail).name);
																			$.set_text(text_4, $.get(mail).date);
																			$.set_text(text_5, $.get(mail).subject);
																			$.set_text(text_6, $.get(mail).teaser);
																		});

																		$.append($$anchor, a_1);
																	});

																	$.append($$anchor, fragment_20);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_19);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_18);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_15);
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