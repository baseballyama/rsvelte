import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Dialog, Stack } from "carbon-components-svelte";

var root = $.from_html(`<p>Last close trigger: <code> </code></p>`);
var root_1 = $.from_html(`<!> <!>`, 1);

var root_2 = $.from_html(
	`<p>Dismiss with <kbd>Escape</kbd>, the backdrop, the close button, or by
      setting <code>open</code> to <code>false</code>.</p> <form method="dialog"><!></form>`,
	1
);

export default function DialogCloseTriggers($$anchor) {
	let open = false;
	let lastTrigger = null;
	var fragment = root_1();
	var node = $.first_child(fragment);

	Stack(node, {
		gap: 5,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			Button(node_1, {
				$$events: { click: () => open = true },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Open modal dialog');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent = ($$anchor) => {
					var p = root();
					var code = $.sibling($.child(p));
					var text_1 = $.only_child(code, true);

					$.reset(p);
					$.template_effect(() => $.set_text(text_1, lastTrigger));
					$.append($$anchor, p);
				};

				$.if(node_2, ($$render) => {
					if (lastTrigger) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	Dialog(node_3, {
		modal: true,
		'aria-label': 'Close trigger example',
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		$$events: {
			close: (e) => {
				lastTrigger = e.detail.trigger;
				console.log("close", e.detail);
			}
		},

		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				gap: 5,
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_2();
					var form = $.sibling($.first_child(fragment_3), 2);
					var node_4 = $.child(form);

					Button(node_4, {
						type: 'submit',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Close');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.reset(form);
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}