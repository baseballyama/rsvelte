import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import InnerShadowTopIcon from "@lucide/svelte/icons/user";
import NavMain from "./nav-main.svelte";
import NavUser from "./nav-user.svelte";
import * as Sidebar from "$lib/components/ui/sidebar/index.js";
import version from "$lib/version";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'navItems']);
var root = $.from_html(`<a><img class="size-5!" alt="Kener Logo"/> <span class="text-base font-semibold">Kener</span> <span class="text-muted-foreground pt-0.5 text-xs font-medium"> </span></a>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function App_sidebar($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const appVersion = version();
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

															$.attribute_effect(
																a,
																($0) => ({
																	href: $0,
																	...props(),
																	class: 'justify-start-safe flex items-center gap-2'
																}),
																[
																	() => clientResolver(resolve, "/manage/app/site-configurations")
																]
															);

															var img = $.child(a);
															var span = $.sibling(img, 4);
															var text = $.only_child(span);

															$.reset(a);

															$.template_effect(
																($0) => {
																	$.set_attribute(img, 'src', $0);
																	$.set_text(text, `v${appVersion ?? ''}`);
																},
																[() => clientResolver(resolve, "/logo96.png")]
															);

															$.append($$anchor, a);
														};

														$.component(node_4, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
															Sidebar_MenuButton($$anchor, {
																class: 'data-[slot=sidebar-menu-button]:p-1.5!',
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

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Sidebar.Content, ($$anchor, Sidebar_Content) => {
					Sidebar_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							NavMain($$anchor, {
								get items() {
									return $$props.navItems;
								}
							});
						},
						$$slots: { default: true }
					});
				});

				var node_6 = $.sibling(node_5, 2);

				$.component(node_6, () => Sidebar.Footer, ($$anchor, Sidebar_Footer) => {
					Sidebar_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							NavUser($$anchor, {});
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
	$.pop();
}