import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BottomAppBar, { Section, AutoAdjust } from '@smui-extra/bottom-app-bar';
import IconButton, { Icon } from '@smui/icon-button';
import LoremIpsum from '$lib/LoremIpsum.svelte';

var root = $.from_html(`<h5>Standard</h5> <!> <img alt="Page content placeholder" src="/page-content.jpg" style="display: block; max-width: 100%; height: auto; margin: 1em auto;"/>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor) {
	let bottomAppBar = $.state(null);
	var fragment = root_1();
	var node = $.first_child(fragment);

	AutoAdjust(node, {
		get bottomAppBar() {
			return $.get(bottomAppBar);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.sibling($.first_child(fragment_1), 2);

			LoremIpsum(node_1, {});
			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	$.bind_this(
		BottomAppBar(node_2, {
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_1();
				var node_3 = $.first_child(fragment_2);

				Section(node_3, {
					children: ($$anchor, $$slotProps) => {
						IconButton($$anchor, {
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('menu');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				Section(node_4, {
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root_1();
						var node_5 = $.first_child(fragment_5);

						IconButton(node_5, {
							'aria-label': 'Search',
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('search');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_6 = $.sibling(node_5, 2);

						IconButton(node_6, {
							'aria-label': 'More',
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('more_vert');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		}),
		($$value) => $.set(bottomAppBar, $$value, true),
		() => $.get(bottomAppBar)
	);

	$.append($$anchor, fragment);
}