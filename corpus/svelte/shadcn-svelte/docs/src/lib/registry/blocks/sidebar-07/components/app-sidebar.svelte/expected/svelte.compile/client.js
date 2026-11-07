import 'svelte/internal/disclose-version';
import AudioWaveformIcon from "@lucide/svelte/icons/audio-waveform";
import BookOpenIcon from "@lucide/svelte/icons/book-open";
import BotIcon from "@lucide/svelte/icons/bot";
import ChartPieIcon from "@lucide/svelte/icons/chart-pie";
import CommandIcon from "@lucide/svelte/icons/command";
import FrameIcon from "@lucide/svelte/icons/frame";
import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
import MapIcon from "@lucide/svelte/icons/map";
import Settings2Icon from "@lucide/svelte/icons/settings-2";
import SquareTerminalIcon from "@lucide/svelte/icons/square-terminal";
import * as $ from 'svelte/internal/client';
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import NavMain from "./nav-main.svelte";
import NavProjects from "./nav-projects.svelte";
import NavUser from "./nav-user.svelte";
import TeamSwitcher from "./team-switcher.svelte";

const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg"
	},
	teams: [
		{
			name: "Acme Inc",
			logo: GalleryVerticalEndIcon,
			plan: "Enterprise"
		},
		{ name: "Acme Corp.", logo: AudioWaveformIcon, plan: "Startup" },
		{ name: "Evil Corp.", logo: CommandIcon, plan: "Free" }
	],
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
	projects: [
		{ name: "Design Engineering", url: "#", icon: FrameIcon },
		{ name: "Sales & Marketing", url: "#", icon: ChartPieIcon },
		{ name: "Travel", url: "#", icon: MapIcon }
	]
};

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'collapsible']);
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function App_sidebar($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		collapsible = $.prop($$props, 'collapsible', 3, "icon"),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Root, ($$anchor, Sidebar_Root) => {
		Sidebar_Root($$anchor, $.spread_props(
			{
				get collapsible() {
					return collapsible();
				}
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
								TeamSwitcher($$anchor, {
									get teams() {
										return data.teams;
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

								NavMain(node_3, {
									get items() {
										return data.navMain;
									}
								});

								var node_4 = $.sibling(node_3, 2);

								NavProjects(node_4, {
									get projects() {
										return data.projects;
									}
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					var node_5 = $.sibling(node_2, 2);

					$.component(node_5, () => Sidebar.Footer, ($$anchor, Sidebar_Footer) => {
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

					var node_6 = $.sibling(node_5, 2);

					$.component(node_6, () => Sidebar.Rail, ($$anchor, Sidebar_Rail) => {
						Sidebar_Rail($$anchor, {});
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