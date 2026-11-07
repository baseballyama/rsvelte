import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PlusIcon from "@lucide/svelte/icons/plus";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import Calendars from "./calendars.svelte";
import DatePicker from "./date-picker.svelte";
import NavUser from "./nav-user.svelte";

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

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <span>New Calendar</span>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function App_sidebar($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

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
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.Header, ($$anchor, Sidebar_Header) => {
					Sidebar_Header($$anchor, {
						class: 'h-16 border-b border-sidebar-border',
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

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Sidebar.Content, ($$anchor, Sidebar_Content) => {
					Sidebar_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_3 = $.first_child(fragment_3);

							DatePicker(node_3, {});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Sidebar.Separator, ($$anchor, Sidebar_Separator) => {
								Sidebar_Separator($$anchor, { class: 'mx-0' });
							});

							var node_5 = $.sibling(node_4, 2);

							Calendars(node_5, {
								get calendars() {
									return data.calendars;
								}
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_6 = $.sibling(node_2, 2);

				$.component(node_6, () => Sidebar.Footer, ($$anchor, Sidebar_Footer) => {
					Sidebar_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_7 = $.first_child(fragment_4);

							$.component(node_7, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
								Sidebar_Menu($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = $.comment();
										var node_8 = $.first_child(fragment_5);

										$.component(node_8, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
											Sidebar_MenuItem($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_9 = $.first_child(fragment_6);

													$.component(node_9, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
														Sidebar_MenuButton($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_7 = root_1();
																var node_10 = $.first_child(fragment_7);

																PlusIcon(node_10, {});
																$.next(2);
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

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				var node_11 = $.sibling(node_6, 2);

				$.component(node_11, () => Sidebar.Rail, ($$anchor, Sidebar_Rail) => {
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