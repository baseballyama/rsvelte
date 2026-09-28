import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Portal, Stack, Tile } from "carbon-components-svelte";

var root = $.from_html(`<strong>Portalled content</strong>`);
var root_1 = $.from_html(`<div>Portal is declared here.</div> <!>`, 1);
var root_2 = $.from_html(`<div>But mounted into this container via <code>target</code>.</div>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function CustomTargetPortal($$anchor) {
	let target = null;

	Stack($$anchor, {
		gap: 4,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			Tile(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_1 = $.sibling($.first_child(fragment_2), 2);

					Portal(node_1, {
						get target() {
							return target;
						},

						children: ($$anchor, $$slotProps) => {
							var strong = root();

							$.append($$anchor, strong);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node, 2);

			Tile(node_2, {
				children: ($$anchor, $$slotProps) => {
					var div = root_2();

					$.bind_this(div, ($$value) => target = $$value, () => target);
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}