import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tooltip from "components/Tooltip";
import Button from "components/Button";
import Code from "docs/Code.svelte";
import tooltip from "examples/tooltip.txt";

var root = $.from_html(`<div slot="activator"><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Tooltips($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Tooltip(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('How are you doing?');

			$.append($$anchor, text);
		},

		$$slots: {
			default: true,
			activator: ($$anchor, $$slotProps) => {
				var div = root();
				var node_1 = $.child(div);

				Button(node_1, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Hover me');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				$.reset(div);
				$.append($$anchor, div);
			}
		}
	});

	var node_2 = $.sibling(node, 2);

	Code(node_2, {
		get code() {
			return tooltip;
		}
	});

	$.append($$anchor, fragment);
}