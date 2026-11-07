import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BottomAppBar, { Section, AutoAdjust } from '@smui-extra/bottom-app-bar';
import IconButton from '@smui/icon-button';
import Fab from '@smui/fab';
import { Icon } from '@smui/common';
import LoremIpsum from '$lib/LoremIpsum.svelte';

var root = $.from_html(`<h5>Inset FAB (Right)</h5> <!> <img alt="Page content placeholder" src="/page-content.jpg" style="display: block; max-width: 100%; height: auto; margin: 1em auto;"/>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor) {
	let bottomAppBar = $.state(null);
	var fragment = root_2();
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
				var fragment_2 = root_2();
				var node_3 = $.first_child(fragment_2);

				Section(node_3, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_1();
						var node_4 = $.first_child(fragment_3);

						IconButton(node_4, {
							'aria-label': 'Archive',
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('archive');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_5 = $.sibling(node_4, 2);

						IconButton(node_5, {
							'aria-label': 'Mark unread',
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('mail');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_6 = $.sibling(node_5, 2);

						IconButton(node_6, {
							'aria-label': 'Label',
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('label');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_7 = $.sibling(node_6, 2);

						IconButton(node_7, {
							'aria-label': 'Trash',
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('delete');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});

				var node_8 = $.sibling(node_3, 2);

				Section(node_8, {
					fabInset: true,
					children: ($$anchor, $$slotProps) => {
						Fab($$anchor, {
							'aria-label': 'Reply',
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('reply');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
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