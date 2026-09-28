import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Avatar from "$lib/components/ui/avatar/index.js";
import * as Sidebar from "$lib/components/ui/sidebar/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="grid flex-1 text-start text-sm leading-tight"><span class="truncate font-medium"> </span> <span class="truncate text-xs text-muted-foreground"> </span></div>`, 1);
var root_2 = $.from_html(`<a target="_blank" rel="noopener noreferrer"><!></a>`);

export default function Nav_user($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
		Sidebar_Menu($$anchor, {
			class: 'rounded-md border border-dashed bg-secondary/30  hover:border-cyan-500/50 ',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
					Sidebar_MenuItem($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var a = root_2();
							var node_2 = $.child(a);

							$.component(node_2, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
								Sidebar_MenuButton($$anchor, {
									size: 'lg',
									class: 'cursor-pointer hover:bg-cyan-800/10 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground',
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root_1();
										var node_3 = $.first_child(fragment_2);

										$.component(node_3, () => Avatar.Root, ($$anchor, Avatar_Root) => {
											Avatar_Root($$anchor, {
												class: 'size-8 rounded-lg',
												children: ($$anchor, $$slotProps) => {
													var fragment_3 = root();
													var node_4 = $.first_child(fragment_3);

													$.component(node_4, () => Avatar.Image, ($$anchor, Avatar_Image) => {
														Avatar_Image($$anchor, {
															get src() {
																return $$props.user.avatar;
															},

															get alt() {
																return $$props.user.name;
															}
														});
													});

													var node_5 = $.sibling(node_4, 2);

													$.component(node_5, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
														Avatar_Fallback($$anchor, {
															class: 'rounded-lg',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text('CN');

																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_3);
												},
												$$slots: { default: true }
											});
										});

										var div = $.sibling(node_3, 2);
										var span = $.child(div);
										var text_1 = $.only_child(span, true);
										var span_1 = $.sibling(span, 2);
										var text_2 = $.only_child(span_1, true);

										$.reset(div);

										$.template_effect(() => {
											$.set_text(text_1, $$props.user.name);
											$.set_text(text_2, $$props.user.desc);
										});

										$.append($$anchor, fragment_2);
									},
									$$slots: { default: true }
								});
							});

							$.reset(a);
							$.template_effect(() => $.set_attribute(a, 'href', $$props.user.visit));
							$.append($$anchor, a);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}