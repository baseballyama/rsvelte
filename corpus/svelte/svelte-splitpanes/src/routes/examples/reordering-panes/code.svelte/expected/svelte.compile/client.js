import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pane, Splitpanes } from 'svelte-splitpanes';
import Button from '$comp/Button.svelte';

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Code($$anchor) {
	const ordered = [{ color: 'red' }, { color: 'blue' }];
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: {
			click: () => {
				const temp = ordered[0];

				ordered[0] = ordered[1];
				ordered[1] = temp;
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Switch');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Splitpanes(node_1, {
		style: 'height: 400px',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.each(node_2, 17, () => ordered, $.index, ($$anchor, val) => {
				Pane($$anchor, {
					minSize: 10,
					children: ($$anchor, $$slotProps) => {
						var span = root();
						let styles;
						var text_1 = $.only_child(span, true);

						$.template_effect(() => {
							styles = $.set_style(span, '', styles, { color: $.get(val).color });
							$.set_text(text_1, $.get(val).color);
						});

						$.append($$anchor, span);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}