import * as $ from 'svelte/internal/server';
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

export default function App_sidebar($$renderer, $$props) {
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

	let { $$slots, $$events, ...restProps } = $$props;

	if (Sidebar.Root) {
		$$renderer.push('<!--[-->');

		Sidebar.Root($$renderer, $.spread_props([
			{ collapsible: 'none', class: 'h-auto border-e' },
			restProps,
			{
				children: ($$renderer) => {
					if (Sidebar.Header) {
						$$renderer.push('<!--[-->');

						Sidebar.Header($$renderer, {
							class: 'border-b',
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
																$$renderer.push(`<a${$.attributes({ href: '##', ...props })}>`);
																InnerShadowTopIcon($$renderer, { class: '!size-5' });
																$$renderer.push(`<!----> <span class="text-base font-semibold">Acme Inc.</span></a>`);
															}

															if (Sidebar.MenuButton) {
																$$renderer.push('<!--[-->');

																Sidebar.MenuButton($$renderer, {
																	class: 'data-[slot=sidebar-menu-button]:!p-1.5',
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
								NavMain($$renderer, { items: data.navMain });
								$$renderer.push(`<!----> `);
								NavDocuments($$renderer, { items: data.documents });
								$$renderer.push(`<!----> `);
								NavSecondary($$renderer, { items: data.navSecondary, class: 'mt-auto' });
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
			}
		]));

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}