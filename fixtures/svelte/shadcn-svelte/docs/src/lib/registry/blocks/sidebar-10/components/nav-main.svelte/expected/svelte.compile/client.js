import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

var root = $.from_html(`<a><!> <span> </span></a>`);

export default function Nav_main($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
		Sidebar_Menu($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.each(node_1, 17, () => $$props.items, (item) => item.title, ($$anchor, item) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
						Sidebar_MenuItem($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_3 = $.first_child(fragment_3);

								{
									const child = ($$anchor, $$arg0) => {
										let props = () => ($$arg0?.()).props;
										var a = root();

										$.attribute_effect(a, () => ({ href: $.get(item).url, ...props() }));

										var node_4 = $.child(a);

										$.component(node_4, () => $.get(item).icon, ($$anchor, item_icon) => {
											item_icon($$anchor, {});
										});

										var span = $.sibling(node_4, 2);
										var text = $.only_child(span, true);

										$.reset(a);
										$.template_effect(() => $.set_text(text, $.get(item).title));
										$.append($$anchor, a);
									};

									$.component(node_3, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
										Sidebar_MenuButton($$anchor, {
											get isActive() {
												return $.get(item).isActive;
											},
											child,
											$$slots: { child: true }
										});
									});
								}

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}