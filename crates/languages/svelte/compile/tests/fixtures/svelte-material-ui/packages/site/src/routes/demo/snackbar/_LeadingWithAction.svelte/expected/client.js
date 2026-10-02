import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Snackbar, { Actions, Label } from '@smui/snackbar';
import Button from '@smui/button';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <pre class="status"> </pre>`, 1);

export default function _LeadingWithAction($$anchor) {
	let snackbar;
	let reason = $.state('nothing yet');

	function handleClosed(e) {
		$.set(reason, e.detail.reason ?? 'Undefined.', true);
	}

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.bind_this(
		Snackbar(node, {
			leading: true,
			onSMUISnackbarClosed: handleClosed,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				Label(node_1, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('This is a leading snackbar.');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				Actions(node_2, {
					children: ($$anchor, $$slotProps) => {
						Button($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Action');

								$.append($$anchor, text_1);
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
		($$value) => snackbar = $$value,
		() => snackbar
	);

	var node_3 = $.sibling(node, 2);

	Button(node_3, {
		onclick: () => snackbar.open(),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Open Snackbar');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var pre = $.sibling(node_3, 2);
	var text_3 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_3, `Closed Reason: ${$.get(reason) ?? ''}`));
	$.append($$anchor, fragment);
}