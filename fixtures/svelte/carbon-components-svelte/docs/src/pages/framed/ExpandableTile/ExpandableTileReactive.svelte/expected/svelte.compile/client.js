import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ButtonSet, ExpandableTile, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div>Extra line added dynamically.</div> <div>The resize observer remeasures the collapsed height.</div>`, 1);
var root_2 = $.from_html(`<div slot="above"><div>Above the fold content here</div> <!></div>`);
var root_3 = $.from_html(`<div slot="below">Below the fold content here</div>`);
var root_4 = $.from_html(`<!> <div>Expanded: <strong> </strong></div> <!>`, 1);

export default function ExpandableTileReactive($$anchor) {
	let expanded = false;
	let grow = false;

	Stack($$anchor, {
		gap: 5,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var node = $.first_child(fragment_1);

			ButtonSet(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Button(node_1, {
						size: 'small',
						$$events: { click: () => expanded = !expanded },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, `${expanded ? "Collapse" : "Expand"}
      tile`));

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					Button(node_2, {
						size: 'small',
						kind: 'secondary',
						$$events: { click: () => grow = !grow },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, `${grow ? "Shrink" : "Grow"}
      content`));

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node, 2);
			var strong = $.sibling($.child(div));
			var text_2 = $.only_child(strong, true);

			$.reset(div);

			var node_3 = $.sibling(div, 2);

			ExpandableTile(node_3, {
				get expanded() {
					return expanded;
				},

				set expanded($$value) {
					expanded = $$value;
				},

				$$slots: {
					above: ($$anchor, $$slotProps) => {
						var div_1 = root_2();
						var node_4 = $.sibling($.child(div_1), 2);

						{
							var consequent = ($$anchor) => {
								var fragment_5 = root_1();

								$.next(2);
								$.append($$anchor, fragment_5);
							};

							$.if(node_4, ($$render) => {
								if (grow) $$render(consequent);
							});
						}

						$.reset(div_1);
						$.append($$anchor, div_1);
					},

					below: ($$anchor, $$slotProps) => {
						var div_2 = root_3();

						$.append($$anchor, div_2);
					}
				}
			});

			$.template_effect(() => $.set_text(text_2, expanded));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}