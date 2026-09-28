import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Snackbar, { Actions, Label } from '@smui/snackbar';
import Button from '@smui/button';
import IconButton, { Icon } from '@smui/icon-button';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <pre class="status"> </pre> <pre class="status"> </pre>`, 1);

export default function _StackedWithAction($$anchor) {
	let snackbar;
	let reason = $.state('nothing yet');
	let action = $.state('nothing yet');

	function handleClosedStacked(e) {
		$.set(reason, e.detail.reason ?? 'Undefined.', true);
	}

	var fragment = root_2();
	var node = $.first_child(fragment);

	$.bind_this(
		Snackbar(node, {
			variant: 'stacked',
			onSMUISnackbarClosed: handleClosedStacked,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				Label(node_1, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('This is a stacked snackbar. Use it when you have really long text.');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				Actions(node_2, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_3 = $.first_child(fragment_2);

						Button(node_3, {
							onclick: () => $.set(action, 'Something'),
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Something');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						var node_4 = $.sibling(node_3, 2);

						Button(node_4, {
							onclick: () => $.set(action, 'Another'),
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('Another');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});

						var node_5 = $.sibling(node_4, 2);

						IconButton(node_5, {
							onclick: () => $.set(action, 'Dismissed'),
							title: 'Dismiss',
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('close');

										$.append($$anchor, text_3);
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}),
		($$value) => snackbar = $$value,
		() => snackbar
	);

	var node_6 = $.sibling(node, 2);

	Button(node_6, {
		onclick: () => snackbar.open(),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Open Snackbar');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var pre = $.sibling(node_6, 2);
	var text_5 = $.only_child(pre);
	var pre_1 = $.sibling(pre, 2);
	var text_6 = $.only_child(pre_1);

	$.template_effect(() => {
		$.set_text(text_5, `Closed Reason: ${$.get(reason) ?? ''}`);
		$.set_text(text_6, `Action: ${$.get(action) ?? ''}`);
	});

	$.append($$anchor, fragment);
}