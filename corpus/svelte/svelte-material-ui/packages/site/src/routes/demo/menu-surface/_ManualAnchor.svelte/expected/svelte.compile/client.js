import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import MenuSurface, { Anchor } from '@smui/menu-surface';
import ImageList, { Item as ImageListItem, ImageAspectContainer, Image } from '@smui/image-list';
import Button from '@smui/button';

var root = $.from_html(`<div style="display: inline-block;"><!> <!></div>`);

export default function _ManualAnchor($$anchor, $$props) {
	$.push($$props, true);

	let surface;
	let anchor = $.state(void 0);
	let anchorClasses = $.proxy({});

	onMount(() => {
		// This sets the menu surface's origin corner to the top end instead of the
		// top start.
		surface.flipCornerHorizontally();
	});

	var div = root();
	var node = $.child(div);

	Button(node, {
		onclick: () => surface.setOpen(true),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Open Menu Surface');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	$.bind_this(
		MenuSurface(node_1, {
			anchor: false,
			get anchorElement() {
				return $.get(anchor);
			},

			set anchorElement($$value) {
				$.set(anchor, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				ImageList($$anchor, {
					class: 'menu-surface-image-list',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						$.each(node_2, 16, () => Array(4), $.index, ($$anchor, _unused, i) => {
							ImageListItem($$anchor, {
								children: ($$anchor, $$slotProps) => {
									ImageAspectContainer($$anchor, {
										children: ($$anchor, $$slotProps) => {
											Image($$anchor, {
												src: `https://placehold.co/100x100?text=Image%20${i + 1}`,
												alt: `Image ${i + 1}`
											});
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		}),
		($$value) => surface = $$value,
		() => surface
	);

	$.reset(div);

	$.action(div, ($$node, $$action_arg) => Anchor?.($$node, $$action_arg), () => ({
		addClass: (className) => {
			if (!anchorClasses[className]) {
				anchorClasses[className] = true;
			}
		},

		removeClass: (className) => {
			if (anchorClasses[className]) {
				delete anchorClasses[className];
			}
		}
	}));

	$.bind_this(div, ($$value) => $.set(anchor, $$value), () => $.get(anchor));
	$.template_effect(($0) => $.set_class(div, 1, $0), [() => $.clsx(Object.keys(anchorClasses).join(' '))]);
	$.append($$anchor, div);
	$.pop();
	// This sets the menu surface's origin corner to the top end instead of the
	// top start.
}