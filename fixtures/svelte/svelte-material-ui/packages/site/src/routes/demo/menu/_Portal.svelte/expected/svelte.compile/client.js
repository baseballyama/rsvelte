import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { on } from 'svelte/events';
import Portal from 'svelte-portal';
import Menu from '@smui/menu';
import { Anchor } from '@smui/menu-surface';
import List, { Item, Separator, Text, Meta } from '@smui/list';
import Button, { Label } from '@smui/button';
import { mdiMenuRight } from '@mdi/js';

var root = $.from_svg(`<svg style="width: 24px; height: 24px;" viewBox="0 0 24 24"><path fill="currentColor"></path></svg>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<div style="min-width: 100px;"><!> <!> <!></div> <pre class="status"> </pre>`, 1);

export default function _Portal($$anchor, $$props) {
	$.push($$props, true);

	let menu;
	let subMenu;
	let anchor;
	let anchorElement = $.state(void 0);
	let anchorClasses = $.proxy({});
	let clicked = $.state('nothing yet');

	function addClass(className) {
		if (!anchorClasses[className]) {
			anchorClasses[className] = true;
		}
	}

	function removeClass(className) {
		if (anchorClasses[className]) {
			delete anchorClasses[className];
		}
	}

	onMount(() => {
		// This tells the menu surface to position itself relative to the body
		// instead of the anchor. Now the menu will position itself next to the
		// anchor, even though the menu itself is located in a portal.
		subMenu.getMenuSurface().setIsHoisted(true);

		$.set(anchorElement, anchor.getElement(), true);

		// END OF RELEVANT CODE
		// The rest of this is a very hacky sub-menu implementation. Since you might
		// not trust me when I say don't do this in production, here are the
		// **known** downsides to this approach:
		//
		// - The menus being out of document order means their tab order is wrong.
		// - Keyboard navigation is buggy. Once in sub-menu, you can't get out.
		// - Screen readers will not be able to tell the user there is a sub-menu.
		//   - Seriously, this one point alone is a deal breaker. It means vision
		//     impaired users cannot use this sub-menu.
		// - Clicking the "More" button causes the menu to close.
		//
		// Now that you know how terrible of an idea it would be to use this, if you
		// decide that you will, and you file any bugs about it, I will point you to
		// this note, and be mad at you.
		const subMenuElement = subMenu.getElement();

		function contains(outer, inner) {
			let check = inner;

			while (check) {
				if (check === outer) {
					return true;
				}

				check = check.parentElement;
			}

			return false;
		}

		on($.get(anchorElement), 'mouseenter', (event) => {
			if (!contains(subMenuElement, event.relatedTarget)) {
				subMenu.setOpen(true);
			}
		});

		on($.get(anchorElement), 'focus', () => {
			on(
				subMenuElement,
				'SMUIMenuSurfaceOpened',
				() => {
					const focusEl = subMenuElement.querySelector('[tabindex="0"]');

					if (focusEl) {
						focusEl.focus();
					}
				},
				{ once: true }
			);

			subMenu.setOpen(true);
		});

		on($.get(anchorElement), 'mouseleave', (event) => {
			if (!contains(subMenuElement, event.relatedTarget)) {
				subMenu.setOpen(false);
			}
		});

		on(subMenuElement, 'mouseleave', (event) => {
			if ($.get(anchorElement) && !contains($.get(anchorElement), event.relatedTarget)) {
				subMenu.setOpen(false);
			}
		});
	});

	var fragment = root_4();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Button(node, {
		onclick: () => menu.setOpen(true),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Open Menu');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	$.bind_this(
		Menu(node_1, {
			onSMUIMenuSurfaceClosed: () => subMenu.setOpen(false),
			children: ($$anchor, $$slotProps) => {
				List($$anchor, {
					disabledItemsFocusable: true,
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_2();
						var node_2 = $.first_child(fragment_3);

						Item(node_2, {
							onSMUIAction: () => $.set(clicked, 'Cut'),
							children: ($$anchor, $$slotProps) => {
								Text($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Cut');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_3 = $.sibling(node_2, 2);

						Item(node_3, {
							onSMUIAction: () => $.set(clicked, 'Copy'),
							children: ($$anchor, $$slotProps) => {
								Text($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Copy');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_4 = $.sibling(node_3, 2);

						Item(node_4, {
							onSMUIAction: () => $.set(clicked, 'Paste'),
							children: ($$anchor, $$slotProps) => {
								Text($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Paste');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_5 = $.sibling(node_4, 2);

						Separator(node_5, {});

						var node_6 = $.sibling(node_5, 2);

						{
							let $0 = $.derived(() => Object.keys(anchorClasses).join(' '));
							let $1 = $.derived(() => [[Anchor, { addClass, removeClass }]]);

							$.bind_this(
								Item(node_6, {
									nonInteractive: true,
									get class() {
										return $.get($0);
									},

									get use() {
										return $.get($1);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root_1();
										var node_7 = $.first_child(fragment_7);

										Text(node_7, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('More');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});

										var node_8 = $.sibling(node_7, 2);

										Meta(node_8, {
											style: 'display: inline-flex; justify-content: center; align-items: center;',
											children: ($$anchor, $$slotProps) => {
												var svg = root();
												var path = $.only_child(svg);

												$.template_effect(() => $.set_attribute(path, 'd', mdiMenuRight));
												$.append($$anchor, svg);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								}),
								($$value) => anchor = $$value,
								() => anchor
							);
						}

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		}),
		($$value) => menu = $$value,
		() => menu
	);

	var node_9 = $.sibling(node_1, 2);

	Portal(node_9, {
		children: ($$anchor, $$slotProps) => {
			$.bind_this(
				Menu($$anchor, {
					anchor: false,
					get anchorElement() {
						return $.get(anchorElement);
					},
					anchorCorner: 'TOP_END',
					children: ($$anchor, $$slotProps) => {
						List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_10 = root_3();
								var node_10 = $.first_child(fragment_10);

								Item(node_10, {
									onSMUIAction: () => {
										$.set(clicked, 'Move');
										menu.setOpen(false);
									},

									children: ($$anchor, $$slotProps) => {
										Text($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Move');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								var node_11 = $.sibling(node_10, 2);

								Separator(node_11, {});

								var node_12 = $.sibling(node_11, 2);

								Item(node_12, {
									onSMUIAction: () => {
										$.set(clicked, 'Delete');
										menu.setOpen(false);
									},

									children: ($$anchor, $$slotProps) => {
										Text($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('Delete');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_10);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				}),
				($$value) => subMenu = $$value,
				() => subMenu
			);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_7 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_7, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}