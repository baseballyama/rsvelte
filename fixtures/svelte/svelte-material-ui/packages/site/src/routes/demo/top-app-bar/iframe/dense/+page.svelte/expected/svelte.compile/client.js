import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TopAppBar, { Row, Section, Title, AutoAdjust } from '@smui/top-app-bar';
import IconButton, { Icon } from '@smui/icon-button';
import LoremIpsum from '$lib/LoremIpsum.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <img alt="Page content placeholder" src="/page-content.jpg" style="display: block; max-width: 100%; height: auto; margin: 1em auto;"/>`, 1);

export default function _page($$anchor) {
	let topAppBar = $.state(null);
	var fragment = root();
	var node = $.first_child(fragment);

	$.bind_this(
		TopAppBar(node, {
			variant: 'standard',
			dense: true,
			children: ($$anchor, $$slotProps) => {
				Row($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						Section(node_1, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_2 = $.first_child(fragment_3);

								IconButton(node_2, {
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

								var node_3 = $.sibling(node_2, 2);

								Title(node_3, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Dense');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});

						var node_4 = $.sibling(node_1, 2);

						Section(node_4, {
							align: 'end',
							toolbar: true,
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = root_1();
								var node_5 = $.first_child(fragment_5);

								IconButton(node_5, {
									'aria-label': 'Download',
									children: ($$anchor, $$slotProps) => {
										Icon($$anchor, {
											class: 'material-icons',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('file_download');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								var node_6 = $.sibling(node_5, 2);

								IconButton(node_6, {
									'aria-label': 'Print this page',
									children: ($$anchor, $$slotProps) => {
										Icon($$anchor, {
											class: 'material-icons',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('print');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								var node_7 = $.sibling(node_6, 2);

								IconButton(node_7, {
									'aria-label': 'Bookmark this page',
									children: ($$anchor, $$slotProps) => {
										Icon($$anchor, {
											class: 'material-icons',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('bookmark');

												$.append($$anchor, text_4);
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
				});
			},
			$$slots: { default: true }
		}),
		($$value) => $.set(topAppBar, $$value, true),
		() => $.get(topAppBar)
	);

	var node_8 = $.sibling(node, 2);

	AutoAdjust(node_8, {
		get topAppBar() {
			return $.get(topAppBar);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root_2();
			var node_9 = $.first_child(fragment_9);

			LoremIpsum(node_9, {});
			$.next(2);
			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}