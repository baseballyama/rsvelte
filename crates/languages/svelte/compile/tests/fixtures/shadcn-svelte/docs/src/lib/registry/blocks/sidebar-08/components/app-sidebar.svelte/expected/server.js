import * as $ from 'svelte/internal/server';
import CommandIcon from "@lucide/svelte/icons/command";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import NavMain from "./nav-main.svelte";
import NavProjects from "./nav-projects.svelte";
import NavSecondary from "./nav-secondary.svelte";
import NavUser from "./nav-user.svelte";
import BookOpenIcon from "@lucide/svelte/icons/book-open";
import BotIcon from "@lucide/svelte/icons/bot";
import ChartPieIcon from "@lucide/svelte/icons/chart-pie";
import FrameIcon from "@lucide/svelte/icons/frame";
import LifeBuoyIcon from "@lucide/svelte/icons/life-buoy";
import MapIcon from "@lucide/svelte/icons/map";
import SendIcon from "@lucide/svelte/icons/send";
import Settings2Icon from "@lucide/svelte/icons/settings-2";
import SquareTerminalIcon from "@lucide/svelte/icons/square-terminal";

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
		{ name: "Sales & Marketing", url: "#", icon: ChartPieIcon },
		{ name: "Travel", url: "#", icon: MapIcon }
	]
};

export default function App_sidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, $$slots, $$events, ...restProps } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Sidebar.Root) {
				$$renderer.push('<!--[-->');

				Sidebar.Root($$renderer, $.spread_props([
					{ variant: 'inset' },
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
																		Sidebar.MenuButton($$renderer, { size: 'lg', child, $$slots: { child: true } });
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
										NavProjects($$renderer, { projects: data.projects });
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}