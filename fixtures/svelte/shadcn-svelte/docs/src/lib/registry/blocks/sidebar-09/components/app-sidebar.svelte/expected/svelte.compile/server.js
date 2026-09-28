import * as $ from 'svelte/internal/server';
import CommandIcon from "@lucide/svelte/icons/command";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import { useSidebar } from "$lib/registry/ui/sidebar/context.svelte.js";
import { Switch } from "$lib/registry/ui/switch/index.js";
import NavUser from "./nav-user.svelte";
import ArchiveXIcon from "@lucide/svelte/icons/archive-x";
import FileIcon from "@lucide/svelte/icons/file";
import InboxIcon from "@lucide/svelte/icons/inbox";
import SendIcon from "@lucide/svelte/icons/send";
import Trash2Icon from "@lucide/svelte/icons/trash-2";

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

export default function App_sidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, $$slots, $$events, ...restProps } = $$props;
		let activeItem = data.navMain[0];
		let mails = data.mails;
		const sidebar = useSidebar();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Sidebar.Root) {
				$$renderer.push('<!--[-->');

				Sidebar.Root($$renderer, $.spread_props([
					{
						collapsible: 'icon',
						class: 'overflow-hidden [&>[data-sidebar=sidebar]]:flex-row'
					},
					restProps,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Sidebar.Root) {
								$$renderer.push('<!--[-->');

								Sidebar.Root($$renderer, {
									collapsible: 'none',
									class: '!w-[calc(var(--sidebar-width-icon)_+_1px)] border-e',
									children: ($$renderer) => {
										if (Sidebar.Header) {
											$$renderer.push('<!--[-->');

											Sidebar.Header($$renderer, {
												children: ($$renderer) => {
													if (Sidebar.Menu) {
														$$renderer.push('<!--[-->');

														Sidebar.Menu($$renderer, {
															children: ($$renderer) => {
																if (Sidebar.MenuItem) {
																	$$renderer.push('<!--[-->');

																	Sidebar.MenuItem($$renderer, {
																		children: ($$renderer) => {
																			{
																				function child($$renderer, { props }) {
																					$$renderer.push(`<a${$.attributes({ href: '##', ...props })}><div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">`);
																					CommandIcon($$renderer, { class: 'size-4' });
																					$$renderer.push(`<!----></div> <div class="grid flex-1 text-start text-sm leading-tight"><span class="truncate font-medium">Acme Inc</span> <span class="truncate text-xs">Enterprise</span></div></a>`);
																				}

																				if (Sidebar.MenuButton) {
																					$$renderer.push('<!--[-->');

																					Sidebar.MenuButton($$renderer, {
																						size: 'lg',
																						class: 'md:h-8 md:p-0',
																						child,
																						$$slots: { child: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}
																			}
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Sidebar.Content) {
											$$renderer.push('<!--[-->');

											Sidebar.Content($$renderer, {
												children: ($$renderer) => {
													if (Sidebar.Group) {
														$$renderer.push('<!--[-->');

														Sidebar.Group($$renderer, {
															children: ($$renderer) => {
																if (Sidebar.GroupContent) {
																	$$renderer.push('<!--[-->');

																	Sidebar.GroupContent($$renderer, {
																		class: 'px-1.5 md:px-0',
																		children: ($$renderer) => {
																			if (Sidebar.Menu) {
																				$$renderer.push('<!--[-->');

																				Sidebar.Menu($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!--[-->`);

																						const each_array = $.ensure_array_like(data.navMain);

																						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																							let item = each_array[$$index];

																							if (Sidebar.MenuItem) {
																								$$renderer.push('<!--[-->');

																								Sidebar.MenuItem($$renderer, {
																									children: ($$renderer) => {
																										{
																											function tooltipContent($$renderer) {
																												$$renderer.push(`<!---->${$.escape(item.title)}`);
																											}

																											if (Sidebar.MenuButton) {
																												$$renderer.push('<!--[-->');

																												Sidebar.MenuButton($$renderer, {
																													tooltipContentProps: { hidden: false },
																													onclick: () => {
																														activeItem = item;

																														const mail = data.mails.sort(() => Math.random() - 0.5);

																														mails = mail.slice(0, Math.max(5, Math.floor(Math.random() * 10) + 1));
																														sidebar.setOpen(true);
																													},
																													isActive: activeItem.title === item.title,
																													class: 'px-2.5 md:px-2',
																													tooltipContent,
																													children: ($$renderer) => {
																														if (item.icon) {
																															$$renderer.push('<!--[-->');
																															item.icon($$renderer, {});
																															$$renderer.push('<!--]-->');
																														} else {
																															$$renderer.push('<!--[!-->');
																															$$renderer.push('<!--]-->');
																														}

																														$$renderer.push(` <span>${$.escape(item.title)}</span>`);
																													},
																													$$slots: { tooltipContent: true, default: true }
																												});

																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}
																										}
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}
																						}

																						$$renderer.push(`<!--]-->`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Sidebar.Footer) {
											$$renderer.push('<!--[-->');

											Sidebar.Footer($$renderer, {
												children: ($$renderer) => {
													NavUser($$renderer, { user: data.user });
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(`  `);

							if (Sidebar.Root) {
								$$renderer.push('<!--[-->');

								Sidebar.Root($$renderer, {
									collapsible: 'none',
									class: 'hidden flex-1 md:flex',
									children: ($$renderer) => {
										if (Sidebar.Header) {
											$$renderer.push('<!--[-->');

											Sidebar.Header($$renderer, {
												class: 'gap-3.5 border-b p-4',
												children: ($$renderer) => {
													$$renderer.push(`<div class="flex w-full items-center justify-between"><div class="text-base font-medium text-foreground">${$.escape(activeItem.title)}</div> `);

													Label($$renderer, {
														class: 'flex items-center gap-2 text-sm',
														children: ($$renderer) => {
															$$renderer.push(`<span>Unreads</span> `);
															Switch($$renderer, { class: 'shadow-none' });
															$$renderer.push(`<!---->`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----></div> `);

													if (Sidebar.Input) {
														$$renderer.push('<!--[-->');
														Sidebar.Input($$renderer, { placeholder: 'Type to search...' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Sidebar.Content) {
											$$renderer.push('<!--[-->');

											Sidebar.Content($$renderer, {
												children: ($$renderer) => {
													if (Sidebar.Group) {
														$$renderer.push('<!--[-->');

														Sidebar.Group($$renderer, {
															class: 'px-0',
															children: ($$renderer) => {
																if (Sidebar.GroupContent) {
																	$$renderer.push('<!--[-->');

																	Sidebar.GroupContent($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!--[-->`);

																			const each_array_1 = $.ensure_array_like(mails);

																			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																				let mail = each_array_1[$$index_1];

																				$$renderer.push(`<a href="##" class="flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"><div class="flex w-full items-center gap-2"><span>${$.escape(mail.name)}</span> <span class="ms-auto text-xs">${$.escape(mail.date)}</span></div> <span class="font-medium">${$.escape(mail.subject)}</span> <span class="line-clamp-2 w-[260px] text-xs whitespace-break-spaces">${$.escape(mail.teaser)}</span></a>`);
																			}

																			$$renderer.push(`<!--]-->`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}