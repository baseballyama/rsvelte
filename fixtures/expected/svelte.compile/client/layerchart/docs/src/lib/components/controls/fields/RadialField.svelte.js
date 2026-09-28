import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { curveCatmullRomClosed, curveLinearClosed } from 'd3-shape';
import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="screenshot-hidden"><!></div>`);

export default function RadialField($$anchor, $$props) {
	$.push($$props, true);

	let curve = $.prop($$props, 'curve', 31, () => $.proxy(curveLinearClosed));
	var div = root_1();
	var node = $.child(div);

	Field(node, {
		label: 'curve: ',
		labelPlacement: 'left',
		dense: true,
		class: 'absolute top-2 right-2 z-1',
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				size: 'sm',
				get value() {
					return curve();
				},

				set value($$value) {
					curve($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					ToggleOption(node_1, {
						get value() {
							return curveLinearClosed;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Linear');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					ToggleOption(node_2, {
						get value() {
							return curveCatmullRomClosed;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('CatmullRom');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}