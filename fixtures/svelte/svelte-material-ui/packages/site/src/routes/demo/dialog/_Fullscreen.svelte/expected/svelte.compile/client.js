import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dialog, { Header, Title, CloseTooltipWrapper, Content, Actions } from '@smui/dialog';
import IconButton, { Icon } from '@smui/icon-button';
import Button, { Label } from '@smui/button';
import LoremIpsum from '$lib/LoremIpsum.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <pre class="status"> </pre>`, 1);

export default function _Fullscreen($$anchor) {
	let open = $.state(false);
	let response = $.state('Nothing yet.');

	function closeHandler(e) {
		switch (e.detail.action) {
			case 'close':
				$.set(response, 'Closed without response.');
				break;

			case 'reject':
				$.set(response, 'Rejected.');
				break;

			case 'accept':
				$.set(response, 'Accepted.');
				break;
		}
	}

	var fragment = root_2();
	var node = $.first_child(fragment);

	Dialog(node, {
		fullscreen: true,
		'aria-labelledby': 'fullscreen-title',
		'aria-describedby': 'fullscreen-content',
		onSMUIDialogClosed: closeHandler,
		get open() {
			return $.get(open);
		},

		set open($$value) {
			$.set(open, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			Header(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					Title(node_2, {
						id: 'fullscreen-title',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Terms and Conditions');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					CloseTooltipWrapper(node_3, {
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

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_1, 2);

			Content(node_4, {
				id: 'fullscreen-content',
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = $.comment();
					var node_5 = $.first_child(fragment_5);

					$.each(node_5, 16, () => Array(3), $.index, ($$anchor, _item) => {
						LoremIpsum($$anchor, {});
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_4, 2);

			Actions(node_6, {
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root();
					var node_7 = $.first_child(fragment_7);

					Button(node_7, {
						action: 'reject',
						children: ($$anchor, $$slotProps) => {
							Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Reject');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					Button(node_8, {
						action: 'accept',
						defaultAction: true,
						children: ($$anchor, $$slotProps) => {
							Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Accept');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node, 2);

	Button(node_9, {
		onclick: () => $.set(open, true),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Open Dialog');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var pre = $.sibling(node_9, 2);
	var text_5 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_5, `Response: ${$.get(response) ?? ''}`));
	$.append($$anchor, fragment);
}