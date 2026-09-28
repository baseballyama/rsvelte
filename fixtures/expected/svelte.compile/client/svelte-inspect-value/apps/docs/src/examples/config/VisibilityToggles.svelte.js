import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from 'svelte-inspect-value';
import values from './values';
import { globalOpts } from '@components/global-opts/globalopts.svelte';

var root = $.from_html(`<!> <div class="input-row"><label>Lengths <input type="checkbox"/></label> <label>Types <input type="checkbox"/></label> <label>Tools <input type="checkbox"/></label> <label>Preview <input type="checkbox"/></label></div>`, 1);

export default function VisibilityToggles($$anchor, $$props) {
	$.push($$props, true);

	let props = $.proxy({
		showLength: true,
		showPreview: true,
		showTools: true,
		showTypes: true
	});

	var fragment = root();
	var node = $.first_child(fragment);

	Inspect(node, $.spread_props(() => props, {
		class: 'not-content mt',
		get theme() {
			return globalOpts.theme;
		},

		get borderless() {
			return globalOpts.borderless;
		},

		get values() {
			return values;
		},
		expandLevel: 0
	}));

	var div = $.sibling(node, 2);
	var label = $.child(div);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.sibling($.child(label_1));

	$.remove_input_defaults(input_1);
	$.reset(label_1);

	var label_2 = $.sibling(label_1, 2);
	var input_2 = $.sibling($.child(label_2));

	$.remove_input_defaults(input_2);
	$.reset(label_2);

	var label_3 = $.sibling(label_2, 2);
	var input_3 = $.sibling($.child(label_3));

	$.remove_input_defaults(input_3);
	$.reset(label_3);
	$.reset(div);
	$.bind_checked(input, () => props.showLength, ($$value) => props.showLength = $$value);
	$.bind_checked(input_1, () => props.showTypes, ($$value) => props.showTypes = $$value);
	$.bind_checked(input_2, () => props.showTools, ($$value) => props.showTools = $$value);
	$.bind_checked(input_3, () => props.showPreview, ($$value) => props.showPreview = $$value);
	$.append($$anchor, fragment);
	$.pop();
}