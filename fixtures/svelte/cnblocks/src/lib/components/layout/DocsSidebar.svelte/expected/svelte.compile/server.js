import * as $ from 'svelte/internal/server';
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

export default function DocsSidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, $$slots, $$events, ...restProps } = $$props;
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Sidebar.Root) {
				$$renderer.push('<!--[-->');

				Sidebar.Root($$renderer, $.spread_props([
					{
						class: 'h-[calc(100vh-4rem)] [--sidebar-width:15rem] md:mt-16'
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
							if (Sidebar.Content) {
								$$renderer.push('<!--[-->');

								Sidebar.Content($$renderer, {
									class: 'overflow-hidden',
									children: ($$renderer) => {
										ScrollArea($$renderer, {
											class: 'h-full pr-1',
											orientation: 'vertical',
											scrollbarYClasses: 'hidden',
											children: ($$renderer) => {
												$$renderer.push(`<div class="space-y-2 pb-3">`);
												NavMain($$renderer, { label: 'Guide', items: data.guide });
												$$renderer.push(`<!----> `);
												NavMain($$renderer, { label: 'Theme Setup', items: data.themeSetup });
												$$renderer.push(`<!----> `);
												NavProjects($$renderer, { label: 'Sponsors', projects: data.resources });
												$$renderer.push(`<!----></div>`);
											},
											$$slots: { default: true }
										});
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
									class: 'gap-0!',
									children: ($$renderer) => {
										NavSecondary($$renderer, { items: data.footer, class: 'mb-0 px-0' });
										$$renderer.push(`<!----> `);
										NavUser($$renderer, { user: data.user });
										$$renderer.push(`<!---->`);
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