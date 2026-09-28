import * as $ from 'svelte/internal/server';
import PlusIcon from "@lucide/svelte/icons/plus";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import Calendars from "./calendars.svelte";
import DatePicker from "./date-picker.svelte";
import NavUser from "./nav-user.svelte";

export default function Sidebar_right($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This is sample data.
		const data = {
			user: {
				name: "shadcn",
				email: "m@example.com",
				avatar: "/avatars/shadcn.jpg"
			},
			calendars: [
				{ name: "My Calendars", items: ["Personal", "Work", "Family"] },
				{ name: "Favorites", items: ["Holidays", "Birthdays"] },
				{ name: "Other", items: ["Travel", "Reminders", "Deadlines"] }
			]
		};

		let { ref = null, $$slots, $$events, ...restProps } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Sidebar.Root) {
				$$renderer.push('<!--[-->');

				Sidebar.Root($$renderer, $.spread_props([
					{
						collapsible: 'none',
						class: 'sticky top-0 hidden h-svh border-s lg:flex'
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
							if (Sidebar.Header) {
								$$renderer.push('<!--[-->');

								Sidebar.Header($$renderer, {
									class: 'h-16 border-b border-sidebar-border',
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

							$$renderer.push(` `);

							if (Sidebar.Content) {
								$$renderer.push('<!--[-->');

								Sidebar.Content($$renderer, {
									children: ($$renderer) => {
										DatePicker($$renderer, {});
										$$renderer.push(`<!----> `);

										if (Sidebar.Separator) {
											$$renderer.push('<!--[-->');
											Sidebar.Separator($$renderer, { class: 'mx-0' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);
										Calendars($$renderer, { calendars: data.calendars });
										$$renderer.push(`<!---->`);
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
										if (Sidebar.Menu) {
											$$renderer.push('<!--[-->');

											Sidebar.Menu($$renderer, {
												children: ($$renderer) => {
													if (Sidebar.MenuItem) {
														$$renderer.push('<!--[-->');

														Sidebar.MenuItem($$renderer, {
															children: ($$renderer) => {
																if (Sidebar.MenuButton) {
																	$$renderer.push('<!--[-->');

																	Sidebar.MenuButton($$renderer, {
																		children: ($$renderer) => {
																			PlusIcon($$renderer, {});
																			$$renderer.push(`<!----> <span>New Calendar</span>`);
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