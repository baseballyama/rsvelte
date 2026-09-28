import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RadioTile, TileGroup } from "carbon-components-svelte";

var root = $.from_html(`<!> <br/> Selected: <strong> </strong>`, 1);

export default function RadioTileReactiveOneWay($$anchor) {
	const values = ["Lite plan", "Standard plan", "Plus plan"];
	let selected = values[1];
	var fragment = root();
	var node = $.first_child(fragment);

	TileGroup(node, {
		legendText: 'Service pricing tiers',
		name: 'plan',
		$$events: { select: ({ detail }) => selected = detail },
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => values, $.index, ($$anchor, value) => {
				{
					let $0 = $.derived(() => selected === $.get(value));

					RadioTile($$anchor, {
						get value() {
							return $.get(value);
						},

						get checked() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, $.get(value)));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var strong = $.sibling(node, 4);
	var text_1 = $.only_child(strong, true);

	$.template_effect(() => $.set_text(text_1, selected));
	$.append($$anchor, fragment);
}