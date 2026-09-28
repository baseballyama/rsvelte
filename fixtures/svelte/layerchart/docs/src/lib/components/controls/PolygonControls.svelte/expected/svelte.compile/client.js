import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RangeField } from 'svelte-ux';

var root = $.from_html(`<div class="flex gap-2 mb-2 screenshot-hidden"><!> <!> <!></div>`);

export default function PolygonControls($$anchor, $$props) {
	$.push($$props, true);

	let starInset = $.prop($$props, 'starInset', 15, undefined),
		rotate = $.prop($$props, 'rotate', 15, undefined),
		cornerRadius = $.prop($$props, 'cornerRadius', 15, 0);

	var div = root();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			RangeField($$anchor, {
				label: 'inset',
				labelPlacement: 'left',
				min: -1,
				max: 1,
				step: 0.1,
				format: 'decimal',
				get value() {
					return starInset();
				},

				set value($$value) {
					starInset($$value);
				}
			});
		};

		$.if(node, ($$render) => {
			if (starInset() !== undefined) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			RangeField($$anchor, {
				label: 'rotate',
				labelPlacement: 'left',
				max: 360,
				get value() {
					return rotate();
				},

				set value($$value) {
					rotate($$value);
				}
			});
		};

		$.if(node_1, ($$render) => {
			if (rotate() !== undefined) $$render(consequent_1);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			RangeField($$anchor, {
				label: 'cornerRadius',
				labelPlacement: 'left',
				max: 50,
				get value() {
					return cornerRadius();
				},

				set value($$value) {
					cornerRadius($$value);
				}
			});
		};

		$.if(node_2, ($$render) => {
			if (cornerRadius() !== undefined) $$render(consequent_2);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}