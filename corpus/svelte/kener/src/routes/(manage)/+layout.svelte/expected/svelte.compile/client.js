import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import "../layout.css";
import "../kener.css";
import "../manage.css";
import { ModeWatcher } from "mode-watcher";
import { resolve } from "$app/paths";
import { page } from "$app/state";
import * as Sidebar from "$lib/components/ui/sidebar/index.js";
import BlendIcon from "@lucide/svelte/icons/blend";
import MailboxIcon from "@lucide/svelte/icons/mailbox";
import AppSidebar from "./manage/app-sidebar.svelte";
import Settings2Icon from "@lucide/svelte/icons/settings-2";
import GlobeIcon from "@lucide/svelte/icons/globe";
import SirenIcon from "@lucide/svelte/icons/siren";
import BellIcon from "@lucide/svelte/icons/bell";
import CodeIcon from "@lucide/svelte/icons/code";
import ChartSplineIcon from "@lucide/svelte/icons/chart-spline";
import CloudAlertIcon from "@lucide/svelte/icons/cloud-alert";
import House from "@lucide/svelte/icons/house";
import BadgeIcon from "@lucide/svelte/icons/id-card";
import ClockAlertIcon from "@lucide/svelte/icons/clock-alert";
import BookOpenIcon from "@lucide/svelte/icons/book-open";
import KeyIcon from "@lucide/svelte/icons/key";
import UsersIcon from "@lucide/svelte/icons/users";
import ShieldIcon from "@lucide/svelte/icons/shield";
import Columns3CogIcon from "@lucide/svelte/icons/columns-3-cog";
import SiteHeader from "./manage/site-header.svelte";
import TemplateIcon from "@lucide/svelte/icons/layout-template";
import clientResolver from "$lib/client/resolver.js";
import DatabaseIcon from "@lucide/svelte/icons/database";
import { Toaster } from "$lib/components/ui/sonner/index.js";
import * as Tooltip from "$lib/components/ui/tooltip/index.js";
import { ROUTE_PERMISSION_MAP } from "$lib/allPerms.js";

var root = $.from_html(`<link rel="stylesheet"/>`);
var root_1 = $.from_html(`<meta name="robots" content="noindex, nofollow"/> <link rel="icon"/> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <div class="p-4 svelte-1a0naxw"><div class="@container/main flex flex-1 svelte-1a0naxw"><!></div></div>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <main class="kener-manage svelte-1a0naxw"><!></main>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	// Navigation items - single source of truth
	const allNavItems = [
		{
			title: "Site Configurations",
			url: "/manage/app/site-configurations",
			icon: Settings2Icon
		},

		{
			title: "Internationalization",
			url: "/manage/app/internationalization",
			icon: GlobeIcon
		},

		{
			title: "Customizations",
			url: "/manage/app/customizations",
			icon: Columns3CogIcon
		},

		{
			title: "Analytics Providers",
			url: "/manage/app/analytics-providers",
			icon: ChartSplineIcon
		},
		{ title: "Pages", url: "/manage/app/pages", icon: BookOpenIcon },
		{
			title: "Monitors",
			url: "/manage/app/monitors",
			icon: BlendIcon
		},

		{
			title: "Monitoring Data",
			url: "/manage/app/monitoring-data",
			icon: DatabaseIcon
		},

		{
			title: "Incidents",
			url: "/manage/app/incidents",
			icon: CloudAlertIcon
		},

		{
			title: "Maintenances",
			url: "/manage/app/maintenances",
			icon: ClockAlertIcon
		},
		{ title: "Alerts", url: "/manage/app/alerts", icon: SirenIcon },
		{
			title: "Subscriptions",
			url: "/manage/app/subscriptions",
			icon: BellIcon
		},
		{ title: "Users", url: "/manage/app/users", icon: UsersIcon },
		{ title: "Roles", url: "/manage/app/roles", icon: ShieldIcon },
		{
			title: "Triggers",
			url: "/manage/app/triggers",
			icon: MailboxIcon
		},

		{
			title: "Templates",
			url: "/manage/app/templates",
			icon: TemplateIcon
		},
		{ title: "Badges", url: "/manage/app/badges", icon: BadgeIcon },
		{ title: "Embed", url: "/manage/app/embed", icon: CodeIcon },
		{
			title: "API Keys",
			url: "/manage/app/api-keys",
			icon: KeyIcon
		}
	];

	const navItems = allNavItems.filter((item) => {
		const routeId = `/(manage)${item.url}`;
		const requiredPermission = ROUTE_PERMISSION_MAP[routeId];

		if (requiredPermission === undefined) return false;
		if (requiredPermission === null) return true;

		return ($$props.data.userPermissions ?? []).includes(requiredPermission);
	}).map((item) => ({ ...item, url: clientResolver(resolve, item.url) }));

	// Derive page title from current URL
	let pageTitle = $.derived(() => navItems.find((item) => page.url.pathname.startsWith(item.url))?.title || "Dashboard");

	var fragment_1 = root_4();

	$.head('1a0naxw', ($$anchor) => {
		var fragment = root_1();
		var link = $.sibling($.first_child(fragment), 2);
		var node = $.sibling(link, 2);

		{
			var consequent = ($$anchor) => {
				var link_1 = root();

				$.template_effect(() => $.set_attribute(link_1, 'href', $$props.data.font.cssSrc));
				$.append($$anchor, link_1);
			};

			$.if(node, ($$render) => {
				if ($$props.data.font?.cssSrc) $$render(consequent);
			});
		}

		var node_1 = $.sibling(node, 2);

		$.html(node_1, () => `
	<style>
		.kener-manage {
			--up: ${$$props.data.siteStatusColors.UP};
			--degraded: ${$$props.data.siteStatusColors.DEGRADED};
			--down: ${$$props.data.siteStatusColors.DOWN};
			--maintenance: ${$$props.data.siteStatusColors.MAINTENANCE};
			--accent: ${$$props.data.siteStatusColors.ACCENT || "#f4f4f5"};
			--accent-foreground: ${$$props.data.siteStatusColors.ACCENT_FOREGROUND || $$props.data.siteStatusColors.ACCENT || "#e96e2d"};
			${$$props.data.font?.family
			? `--font-family:'${$$props.data.font.family}', sans-serif;`
			: ""}
		}
		:is(.dark) .kener-manage {
			--up: ${$$props.data.siteStatusColorsDark.UP};
			--degraded: ${$$props.data.siteStatusColorsDark.DEGRADED};
			--down: ${$$props.data.siteStatusColorsDark.DOWN};
			--maintenance: ${$$props.data.siteStatusColorsDark.MAINTENANCE};
			--accent: ${$$props.data.siteStatusColorsDark.ACCENT || "#27272a"};
			--accent-foreground: ${$$props.data.siteStatusColorsDark.ACCENT_FOREGROUND || $$props.data.siteStatusColorsDark.ACCENT || "#e96e2d"};
		}
	</style>`);

		$.template_effect(($0) => $.set_attribute(link, 'href', $0), [() => clientResolver(resolve, "/logo96.png")]);

		$.deferred_template_effect(() => {
			$.document.title = `${$.get(pageTitle) ?? ''} | Kener`;
		});

		$.append($$anchor, fragment);
	});

	var node_2 = $.first_child(fragment_1);

	ModeWatcher(node_2, {
		get defaultMode() {
			return $$props.data.defaultSiteTheme;
		}
	});

	var node_3 = $.sibling(node_2, 2);

	Toaster(node_3, {});

	var main = $.sibling(node_3, 2);
	var node_4 = $.child(main);

	$.component(node_4, () => Sidebar.Provider, ($$anchor, Sidebar_Provider) => {
		Sidebar_Provider($$anchor, {
			style: '--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12);',
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_3();
				var node_5 = $.first_child(fragment_2);

				AppSidebar(node_5, {
					variant: 'inset',
					get navItems() {
						return navItems;
					}
				});

				var node_6 = $.sibling(node_5, 2);

				$.component(node_6, () => Sidebar.Inset, ($$anchor, Sidebar_Inset) => {
					Sidebar_Inset($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_2();
							var node_7 = $.first_child(fragment_3);

							SiteHeader(node_7, {
								get title() {
									return $.get(pageTitle);
								}
							});

							var div = $.sibling(node_7, 2);
							var div_1 = $.child(div);
							var node_8 = $.child(div_1);

							$.component(node_8, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
								Tooltip_Provider($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_9 = $.first_child(fragment_4);

										$.snippet(node_9, () => $$props.children);
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div_1);
							$.reset(div);
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

	$.reset(main);
	$.append($$anchor, fragment_1);
	$.pop();
}