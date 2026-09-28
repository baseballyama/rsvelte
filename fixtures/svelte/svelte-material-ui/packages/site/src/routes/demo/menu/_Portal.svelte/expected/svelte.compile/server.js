import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { on } from 'svelte/events';
import Portal from 'svelte-portal';
import Menu from '@smui/menu';
import { Anchor } from '@smui/menu-surface';
import List, { Item, Separator, Text, Meta } from '@smui/list';
import Button, { Label } from '@smui/button';
import { mdiMenuRight } from '@mdi/js';

export default function _Portal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let menu;
		let subMenu;
		let anchor;
		let anchorElement = void 0;
		let anchorClasses = {};
		let clicked = 'nothing yet';

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

			anchorElement = anchor.getElement();

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

			on(anchorElement, 'mouseenter', (event) => {
				if (!contains(subMenuElement, event.relatedTarget)) {
					subMenu.setOpen(true);
				}
			});

			on(anchorElement, 'focus', () => {
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

			on(anchorElement, 'mouseleave', (event) => {
				if (!contains(subMenuElement, event.relatedTarget)) {
					subMenu.setOpen(false);
				}
			});

			on(subMenuElement, 'mouseleave', (event) => {
				if (anchorElement && !contains(anchorElement, event.relatedTarget)) {
					subMenu.setOpen(false);
				}
			});
		});

		$$renderer.push(`<div style="min-width: 100px;">`);

		Button($$renderer, {
			onclick: () => menu.setOpen(true),
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Open Menu`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Menu($$renderer, {
			onSMUIMenuSurfaceClosed: () => subMenu.setOpen(false),
			children: ($$renderer) => {
				List($$renderer, {
					disabledItemsFocusable: true,
					children: ($$renderer) => {
						Item($$renderer, {
							onSMUIAction: () => clicked = 'Cut',
							children: ($$renderer) => {
								Text($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Cut`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Item($$renderer, {
							onSMUIAction: () => clicked = 'Copy',
							children: ($$renderer) => {
								Text($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Copy`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Item($$renderer, {
							onSMUIAction: () => clicked = 'Paste',
							children: ($$renderer) => {
								Text($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Paste`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);
						Separator($$renderer, {});
						$$renderer.push(`<!----> `);

						Item($$renderer, {
							nonInteractive: true,
							class: Object.keys(anchorClasses).join(' '),
							use: [[Anchor, { addClass, removeClass }]],
							children: ($$renderer) => {
								Text($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->More`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Meta($$renderer, {
									style: 'display: inline-flex; justify-content: center; align-items: center;',
									children: ($$renderer) => {
										$$renderer.push(`<svg style="width: 24px; height: 24px;" viewBox="0 0 24 24"><path fill="currentColor"${$.attr('d', mdiMenuRight)}></path></svg>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Portal($$renderer, {
			children: ($$renderer) => {
				Menu($$renderer, {
					anchor: false,
					anchorElement,
					anchorCorner: 'TOP_END',
					children: ($$renderer) => {
						List($$renderer, {
							children: ($$renderer) => {
								Item($$renderer, {
									onSMUIAction: () => {
										clicked = 'Move';
										menu.setOpen(false);
									},

									children: ($$renderer) => {
										Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Move`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);
								Separator($$renderer, {});
								$$renderer.push(`<!----> `);

								Item($$renderer, {
									onSMUIAction: () => {
										clicked = 'Delete';
										menu.setOpen(false);
									},

									children: ($$renderer) => {
										Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Delete`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <pre class="status">Clicked: ${$.escape(clicked)}</pre>`);
	});
}