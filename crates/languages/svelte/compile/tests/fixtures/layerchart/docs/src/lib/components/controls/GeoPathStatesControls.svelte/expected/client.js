import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SelectField } from 'svelte-ux';

var root = $.from_html(`<div class="grid grid-cols-[1fr_1fr_1fr] gap-2 my-4 screenshot-hidden"><!> <!></div>`);

export default function GeoPathStatesControls($$anchor, $$props) {
	$.push($$props, true);

	let selectedStateId = $.prop($$props, 'selectedStateId', 15, '54'),
		projection = $.prop($$props, 'projection', 15);

	var div = root();
	var node = $.child(div);

	SelectField(node, {
		label: 'State',
		get options() {
			return $$props.stateOptions;
		},
		clearable: false,
		toggleIcon: null,
		stepper: true,
		get value() {
			return selectedStateId();
		},

		set value($$value) {
			selectedStateId($$value);
		}
	});

	var node_1 = $.sibling(node, 2);

	SelectField(node_1, {
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