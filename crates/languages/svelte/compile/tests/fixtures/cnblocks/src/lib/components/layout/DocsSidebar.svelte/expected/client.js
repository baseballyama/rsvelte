import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sidebar from "$lib/components/ui/sidebar/index.js";
import NavMain from "./nav-main.svelte";
import NavProjects from "./nav-projects.svelte";
import NavSecondary from "./nav-secondary.svelte";
import NavUser from "./nav-user.svelte";
import SendFeedback from "$lib/svgs/send-feedback.svelte";
import SponsorProject from "$lib/svgs/sponsor-project.svelte";
import { ScrollArea } from "$lib/components/ui/scroll-area";

import {
	docsV2FooterActions,
	docsV2GuideItems,
	docsV2ResourceItems,
	docsV2TemplateItems,
	docsV2ThemeItems
} from "$lib/config/docs-v2";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);
var root = $.from_html(`<div class="space-y-2 pb-3"><!> <!> <!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function DocsSidebar($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const footerIcons = { feedback: SendFeedback, sponsor: SponsorProject };

	const data = {
		user: {
			name: "Bhide Svelte",
			desc: "Svelte Shadcn Blocks",
			avatar: "https://github.com/SikandarJODD.png",
			visit: "https://bhide.dev?utm_source=cnblocks"
		},
		guide: docsV2GuideItems,
		themeSetup: docsV2ThemeItems,
		templates: docsV2TemplateItems.map((item) => ({
			name: item.title,
			url: item.url,
			badge: item.badge,
			external: item.external
		})),

		resources: docsV2ResourceItems.map((item) => ({
			name: item.title,
			url: item.url,
			badge: item.badge,
			external: item.external
		})),

		footer: docsV2FooterActions.map((item) => ({
			title: item.title,
			url: item.url,
			external: item.external,
			icon: footerIcons[item.key]
		}))
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Root, ($$anchor, Sidebar_Root) => {
		Sidebar_Root($$anchor, $.spread_props(
			{
				class: 'h-[calc(100vh-4rem)] [--sidebar-width:15rem] md:mt-16'
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

					$.component(node_1, () => Sidebar.Content, ($$anchor, Sidebar_Content) => {
						Sidebar_Content($$anchor, {
							class: 'overflow-hidden',
							children: ($$anchor, $$slotProps) => {
								ScrollArea($$anchor, {
									class: 'h-full pr-1',
									orientation: 'vertical',
									scrollbarYClasses: 'hidden',
									children: ($$anchor, $$slotProps) => {
										var div = root();
										var node_2 = $.child(div);

										NavMain(node_2, {
											label: 'Guide',
											get items() {
												return data.guide;
											}
										});

										var node_3 = $.sibling(node_2, 2);

										NavMain(node_3, {
											label: 'Theme Setup',
											get items() {
												return data.themeSetup;
											}
										});

										var node_4 = $.sibling(node_3, 2);

										NavProjects(node_4, {
											label: 'Sponsors',
											get projects() {
												return data.resources;
											}
										});

										$.reset(div);
										$.append($$anchor, div);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					});

					var node_5 = $.sibling(node_1, 2);

					$.component(node_5, () => Sidebar.Footer, ($$anchor, Sidebar_Footer) => {
						Sidebar_Footer($$anchor, {
							class: 'gap-0!',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_1();
								var node_6 = $.first_child(fragment_3);

								NavSecondary(node_6, {
									get items() {
										return data.footer;
									},
									class: 'mb-0 px-0'
								});

								var node_7 = $.sibling(node_6, 2);

								NavUser(node_7, {
									get user() {
										return data.user;
									}
								});

								$.append($$anchor, fragment_3);
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