import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pane, Splitpanes } from 'svelte-splitpanes';
import Button from '$comp/Button.svelte';

var root = $.from_html(`<span>1</span>`);
var root_1 = $.from_html(`<span>2</span>`);
var root_2 = $.from_html(`<span>3</span>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function Code($$anchor) {
	function onClick() {
		visible = !visible;
	}

	let visible = true;
	var fragment = root_4();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: { click: onClick },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, visible ? 'Hide' : 'Show'));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Splitpanes(node_1, {
		style: 'height: 400px',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_3();
			var node_2 = $.first_child(fragment_2);

			Pane(node_2, {
				children: ($$anchor, $$slotProps) => {
					var span = root();

					$.append($$anchor, span);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent = ($$anchor) => {
					Pane($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var span_1 = root_1();

							$.append($$anchor, span_1);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_3, ($$render) => {
					if (visible) $$render(consequent);
				});
			}

			var node_4 = $.sibling(node_3, 2);

			Pane(node_4, {
				children: ($$anchor, $$slotProps) => {
					var span_2 = root_2();

					$.append($$anchor, span_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}