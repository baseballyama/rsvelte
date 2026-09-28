import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SelectField } from 'svelte-ux';

var root = $.from_html(`<div class="grid grid-cols-[1fr] gap-2 mb-4 screeenshot-hidden"><!></div>`);

export default function GeoPathProjectionControls($$anchor, $$props) {
	$.push($$props, true);

	let projection = $.prop($$props, 'projection', 15);
	var div = root();
	var node = $.child(div);

	SelectField(node, {
		label: 'Projections',
		get options() {
			return $$props.projections;
		},
		clearable: false,
		toggleIcon: null,
		stepper: true,
		get value() {
			return projection();
		},

		set value($$value) {
			projection($$value);
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}