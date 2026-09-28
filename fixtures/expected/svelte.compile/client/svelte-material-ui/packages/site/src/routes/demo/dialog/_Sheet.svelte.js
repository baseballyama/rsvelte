import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dialog, { CloseTooltipWrapper, Content } from '@smui/dialog';
import IconButton, { Icon } from '@smui/icon-button';
import Button, { Label } from '@smui/button';
import LoremIpsum from '$lib/LoremIpsum.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function _Sheet($$anchor) {
	let open = $.state(false);
	let openNoPadding = $.state(false);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Dialog(node, {
		sheet: true,
		'aria-describedby': 'sheet-content',
		get open() {
			return $.get(open);
		},

		set open($$value) {
			$.set(open, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			CloseTooltipWrapper(node_1, {
				children: ($$anchor, $$slotProps) => {
					IconButton($$anchor, {
						action: 'close',
						children: ($$anchor, $$slotProps) => {
							Icon($$anchor, {
								class: 'material-icons',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('close');

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

			var node_2 = $.sibling(node_1, 2);

			Content(node_2, {
				id: 'sheet-content',
				children: ($$anchor, $$slotProps) => {
					LoremIpsum($$anchor, {});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	Dialog(node_3, {
		noContentPadding: true,
		sheet: true,
		'aria-describedby': 'sheet-no-padding-content',
		get open() {
			return $.get(openNoPadding);
		},

		set open($$value) {
			$.set(openNoPadding, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root();
			var node_4 = $.first_child(fragment_5);

			CloseTooltipWrapper(node_4, {
				children: ($$anchor, $$slotProps) => {
					IconButton($$anchor, {
						action: 'close',
						children: ($$anchor, $$slotProps) => {
							Icon($$anchor, {
								class: 'material-icons',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('close');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Content(node_5, {
				id: 'sheet-no-padding-content',
				children: ($$anchor, $$slotProps) => {
					LoremIpsum($$anchor, {});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_3, 2);

	Button(node_6, {
		onclick: () => $.set(open, true),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Open Dialog');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Button(node_7, {
		onclick: () => $.set(openNoPadding, true),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Open No Padding Dialog');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}