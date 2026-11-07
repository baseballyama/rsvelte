import 'svelte/internal/disclose-version';
import BookOpenIcon from "@lucide/svelte/icons/book-open";
import BotIcon from "@lucide/svelte/icons/bot";
import CommandIcon from "@lucide/svelte/icons/command";
import FrameIcon from "@lucide/svelte/icons/frame";
import LifeBuoyIcon from "@lucide/svelte/icons/life-buoy";
import MapIcon from "@lucide/svelte/icons/map";
import PieChartIcon from "@lucide/svelte/icons/pie-chart";
import SendIcon from "@lucide/svelte/icons/send";
import Settings2Icon from "@lucide/svelte/icons/settings-2";
import SquareTerminalIcon from "@lucide/svelte/icons/square-terminal";
import * as $ from 'svelte/internal/client';
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import NavMain from "./nav-main.svelte";
import NavProjects from "./nav-projects.svelte";
import NavSecondary from "./nav-secondary.svelte";
import NavUser from "./nav-user.svelte";

const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg"
	},
	navMain: [
		{
			title: "Playground",
			url: "#",
			icon: SquareTerminalIcon,
			isActive: true,
			items: [
				{ title: "History", url: "#" },
				{ title: "Starred", url: "#" },
				{ title: "Settings", url: "#" }
			]
		},

		{
			title: "Models",
			url: "#",
			icon: BotIcon,
			items: [
				{ title: "Genesis", url: "#" },
				{ title: "Explorer", url: "#" },
				{ title: "Quantum", url: "#" }
			]
		},

		{
			title: "Documentation",
			url: "#",
			icon: BookOpenIcon,
			items: [
				{ title: "Introduction", url: "#" },
				{ title: "Get Started", url: "#" },
				{ title: "Tutorials", url: "#" },
				{ title: "Changelog", url: "#" }
			]
		},

		{
			title: "Settings",
			url: "#",
			icon: Settings2Icon,
			items: [
				{ title: "General", url: "#" },
				{ title: "Team", url: "#" },
				{ title: "Billing", url: "#" },
				{ title: "Limits", url: "#" }
			]
		}
	],
	navSecondary: [
		{ title: "Support", url: "#", icon: LifeBuoyIcon },
		{ title: "Feedback", url: "#", icon: SendIcon }
	],
	projects: [
		{ name: "Design Engineering", url: "#", icon: FrameIcon },
		{ name: "Sales & Marketing", url: "#", icon: PieChartIcon },
		{ name: "Travel", url: "#", icon: MapIcon }
	]
};

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);
var root = $.from_html(`<a><div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><!></div> <div class="grid flex-1 text-start text-sm leading-tight"><span class="truncate font-medium">Acme Inc</span> <span class="truncate text-xs">Enterprise</span></div></a>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function App_sidebar($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Root, ($$anchor, Sidebar_Root) => {
		Sidebar_Root($$anchor, $.spread_props(
			{
				class: 'top-(--header-height) h-[calc(100svh-var(--header-height))]!'
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

																var div = $.child(a);
																var node_5 = $.child(div);

																CommandIcon(node_5, { class: 'size-4' });
																$.reset(div);
																$.next(2);
																$.reset(a);
																$.append($$anchor, a);
															};

															$.component(node_4, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																Sidebar_MenuButton($$anchor, { size: 'lg', child, $$slots: { child: true } });
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

								NavProjects(node_8, {
									get projects() {
										return data.projects;
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
			}
		));
	});

	$.append($$anchor, fragment);
	$.pop();
}