import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RangeField } from 'svelte-ux';

var root = $.from_html(`<div class="grid grid-flow-col gap-3 mb-2 screenshot-hidden"><!> <!></div>`);

export default function ArcControls($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, undefined),
		segments = $.prop($$props, 'segments', 15, undefined);

	var div = root();
	var node = $.child(div);

	RangeField(node, {
		label: 'Value',
		get value() {
			return value();
		},

		set value($$value) {
			value($$value);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			RangeField($$anchor, {
				label: 'Segments',
				min: 2,
				get value() {
					return segments();
				},

				set value($$value) {
					segments($$value);
				}
			});
		};

		$.if(node_1, ($$render) => {
			if (segments() !== undefined) $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}