import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import NavMain from "./nav-main.svelte";
import SidebarOptInForm from "./sidebar-opt-in-form.svelte";

const data = {
	navMain: [
		{
			title: "Getting Started",
			url: "#",
			items: [
				{ title: "Installation", url: "#" },
				{ title: "Project Structure", url: "#" }
			]
		},

		{
			title: "Build Your Application",
			url: "#",
			items: [
				{ title: "Routing", url: "#" },
				{ title: "Data Fetching", url: "#", isActive: true },
				{ title: "Rendering", url: "#" },
				{ title: "Caching", url: "#" },
				{ title: "Styling", url: "#" },
				{ title: "Optimizing", url: "#" },
				{ title: "Configuring", url: "#" },
				{ title: "Testing", url: "#" },
				{ title: "Authentication", url: "#" },
				{ title: "Deploying", url: "#" },
				{ title: "Upgrading", url: "#" },
				{ title: "Examples", url: "#" }
			]
		},

		{
			title: "API Reference",
			url: "#",
			items: [
				{ title: "Components", url: "#" },
				{ title: "File Conventions", url: "#" },
				{ title: "Functions", url: "#" },
				{ title: "next.config.js Options", url: "#" },
				{ title: "CLI", url: "#" },
				{ title: "Edge Runtime", url: "#" }
			]
		},

		{
			title: "Architecture",
			url: "#",
			items: [
				{ title: "Accessibility", url: "#" },
				{ title: "Fast Refresh", url: "#" },
				{ title: "Next.js Compiler", url: "#" },
				{ title: "Supported Browsers", url: "#" },
				{ title: "Turbopack", url: "#" }
			]
		}
	]
};

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);
var root = $.from_html(`<a><div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><!></div> <div class="flex flex-col gap-0.5 leading-none"><span class="font-medium">Documentation</span> <span>v1.0.0</span></div></a>`);
var root_1 = $.from_html(`<div class="p-1"><!></div>`);
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

															GalleryVerticalEndIcon(node_5, { class: 'size-4' });
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
							NavMain($$anchor, {
								get items() {
									return data.navMain;
								}
							});
						},
						$$slots: { default: true }
					});
				});

				var node_7 = $.sibling(node_6, 2);

				$.component(node_7, () => Sidebar.Footer, ($$anchor, Sidebar_Footer) => {
					Sidebar_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var div_1 = root_1();
							var node_8 = $.child(div_1);

							SidebarOptInForm(node_8, {});
							$.reset(div_1);
							$.append($$anchor, div_1);
						},
						$$slots: { default: true }
					});
				});

				var node_9 = $.sibling(node_7, 2);

				$.component(node_9, () => Sidebar.Rail, ($$anchor, Sidebar_Rail) => {
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