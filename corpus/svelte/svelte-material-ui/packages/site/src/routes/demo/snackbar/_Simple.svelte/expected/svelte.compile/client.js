import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Snackbar, { Actions, Label } from '@smui/snackbar';
import Button from '@smui/button';
import IconButton, { Icon } from '@smui/icon-button';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function _Simple($$anchor) {
	let snackbarWithClose;
	let snackbarWithoutClose;
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.bind_this(
		Snackbar(node, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				Label(node_1, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('This is a snackbar.');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				Actions(node_2, {
					children: ($$anchor, $$slotProps) => {
						IconButton($$anchor, {
							title: 'Dismiss',
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}),
		($$value) => snackbarWithClose = $$value,
		() => snackbarWithClose
	);

	var node_3 = $.sibling(node, 2);

	$.bind_this(
		Snackbar(node_3, {
			children: ($$anchor, $$slotProps) => {
				Label($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('This is a snackbar.');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		}),
		($$value) => snackbarWithoutClose = $$value,
		() => snackbarWithoutClose
	);

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, {
		onclick: () => snackbarWithClose.open(),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Open Snackbar With Dismiss');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Button(node_5, {
		onclick: () => snackbarWithoutClose.open(),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Open Snackbar Without Dismiss');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}