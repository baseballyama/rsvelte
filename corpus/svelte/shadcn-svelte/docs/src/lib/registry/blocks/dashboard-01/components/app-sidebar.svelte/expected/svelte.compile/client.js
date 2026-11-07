import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CameraIcon from "@tabler/icons-svelte/icons/camera";
import ChartBarIcon from "@tabler/icons-svelte/icons/chart-bar";
import DashboardIcon from "@tabler/icons-svelte/icons/dashboard";
import DatabaseIcon from "@tabler/icons-svelte/icons/database";
import FileAiIcon from "@tabler/icons-svelte/icons/file-ai";
import FileDescriptionIcon from "@tabler/icons-svelte/icons/file-description";
import FileWordIcon from "@tabler/icons-svelte/icons/file-word";
import FolderIcon from "@tabler/icons-svelte/icons/folder";
import HelpIcon from "@tabler/icons-svelte/icons/help";
import InnerShadowTopIcon from "@tabler/icons-svelte/icons/inner-shadow-top";
import ListDetailsIcon from "@tabler/icons-svelte/icons/list-details";
import ReportIcon from "@tabler/icons-svelte/icons/report";
import SearchIcon from "@tabler/icons-svelte/icons/search";
import SettingsIcon from "@tabler/icons-svelte/icons/settings";
import UsersIcon from "@tabler/icons-svelte/icons/users";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import NavDocuments from "./nav-documents.svelte";
import NavMain from "./nav-main.svelte";
import NavSecondary from "./nav-secondary.svelte";
import NavUser from "./nav-user.svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<a><!> <span class="text-base font-semibold">Acme Inc.</span></a>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function App_sidebar($$anchor, $$props) {
	const data = {
		user: {
			name: "shadcn",
			email: "m@example.com",
			avatar: "/avatars/shadcn.jpg"
		},
		navMain: [
			{ title: "Dashboard", url: "#", icon: DashboardIcon },
			{ title: "Lifecycle", url: "#", icon: ListDetailsIcon },
			{ title: "Analytics", url: "#", icon: ChartBarIcon },
			{ title: "Projects", url: "#", icon: FolderIcon },
			{ title: "Team", url: "#", icon: UsersIcon }
		],
		navClouds: [
			{
				title: "Capture",
				icon: CameraIcon,
				isActive: true,
				url: "#",
				items: [
					{ title: "Active Proposals", url: "#" },
					{ title: "Archived", url: "#" }
				]
			},

			{
				title: "Proposal",
				icon: FileDescriptionIcon,
				url: "#",
				items: [
					{ title: "Active Proposals", url: "#" },
					{ title: "Archived", url: "#" }
				]
			},

			{
				title: "Prompts",
				icon: FileAiIcon,
				url: "#",
				items: [
					{ title: "Active Proposals", url: "#" },
					{ title: "Archived", url: "#" }
				]
			}
		],
		navSecondary: [
			{ title: "Settings", url: "#", icon: SettingsIcon },
			{ title: "Get Help", url: "#", icon: HelpIcon },
			{ title: "Search", url: "#", icon: SearchIcon }
		],
		documents: [
			{ name: "Data Library", url: "#", icon: DatabaseIcon },
			{ name: "Reports", url: "#", icon: ReportIcon },
			{ name: "Word Assistant", url: "#", icon: FileWordIcon }
		]
	};

	let restProps = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Root, ($$anchor, Sidebar_Root) => {
		Sidebar_Root($$anchor, $.spread_props({ collapsible: 'offcanvas' }, () => restProps, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.Header, ($$anchor, Sidebar_Header) => {
					Sidebar_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
								Sidebar_Menu($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
											Sidebar_MenuItem($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = $.comment();
													var node_4 = $.first_child(fragment_4);

													{
														const child = ($$anchor, $$arg0) => {
															let props = () => ($$arg0?.()).props;
															var a = root();

															$.attribute_effect(a, () => ({ href: '##', ...props() }));

															var node_5 = $.child(a);

															InnerShadowTopIcon(node_5, { class: '!size-5' });
															$.next(2);
															$.reset(a);
															$.append($$anchor, a);
														};

														$.component(node_4, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
															Sidebar_MenuButton($$anchor, {
																class: 'data-[slot=sidebar-menu-button]:!p-1.5',
																child,
																$$slots: { child: true }
															});
														});
													}

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
				});

				var node_6 = $.sibling(node_1, 2);

				$.component(node_6, () => Sidebar.Content, ($$anchor, Sidebar_Content) => {
					Sidebar_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_1();
							var node_7 = $.first_child(fragment_5);

							NavMain(node_7, {
								get items() {
									return data.navMain;
								}
							});

							var node_8 = $.sibling(node_7, 2);

							NavDocuments(node_8, {
								get items() {
									return data.documents;
								}
							});

							var node_9 = $.sibling(node_8, 2);

							NavSecondary(node_9, {
								get items() {
									return data.navSecondary;
								},
								class: 'mt-auto'
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				});

				var node_10 = $.sibling(node_6, 2);

				$.component(node_10, () => Sidebar.Footer, ($$anchor, Sidebar_Footer) => {
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	$.append($$anchor, fragment);
}