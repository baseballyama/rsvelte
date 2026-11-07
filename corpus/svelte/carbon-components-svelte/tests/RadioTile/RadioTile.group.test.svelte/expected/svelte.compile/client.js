import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "carbon-components-svelte/Button/Button.svelte";
import RadioTile from "carbon-components-svelte/Tile/RadioTile.svelte";
import TileGroup from "carbon-components-svelte/Tile/TileGroup.svelte";

var root = $.from_html(`<!> <div> </div> <!>`, 1);

export default function RadioTile_group_test($$anchor) {
	const values = ["Lite plan", "Standard plan", "Plus plan"];
	let selected = values[1];
	var fragment = root();
	var node = $.first_child(fragment);

	TileGroup(node, {
		legendText: 'Service pricing tiers',
		name: 'plan',
		get selected() {
			return selected;
		},

		set selected($$value) {
			selected = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => values, $.index, ($$anchor, value) => {
				RadioTile($$anchor, {
					get value() {
						return $.get(value);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, $.get(value)));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var text_1 = $.only_child(div);
	var node_2 = $.sibling(div, 2);

	{
		let $0 = $.derived(() => selected === values[1]);

		Button(node_2, {
			size: 'small',
			get disabled() {
				return $.get($0);
			},
			$$events: { click: () => selected = values[1] },
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_2 = $.text();

				$.template_effect(() => $.set_text(text_2, `Set to "${values[1] ?? ''}"`));
				$.append($$anchor, text_2);
			},
			$$slots: { default: true }
		});
	}

	$.template_effect(() => $.set_text(text_1, `Selected: ${selected ?? ''}`));
	$.append($$anchor, fragment);
}