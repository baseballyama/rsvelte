import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RangeField } from 'svelte-ux';

var root = $.from_html(`<div class="mb-4 screenshot-hidden"><!></div>`);

export default function VoronoiControls($$anchor, $$props) {
	$.push($$props, true);

	let radius = $.prop($$props, 'radius', 15);
	var div = root();
	var node = $.child(div);

	RangeField(node, {
		label: 'Radius',
		max: 100,
		get value() {
			return radius();
		},

		set value($$value) {
			radius($$value);
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}