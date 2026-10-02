import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from '$lib/index.js';

var root = $.from_html(`<div style="max-width: 600px" class="flex col"><!> <!> <!></div>`);

export default function ConfiguredExample($$anchor, $$props) {
	$.push($$props, true);

	const data = { a: 1, b: 2, c: 3, d: { a: 1, b: 2, c: 3 } };
	const InspectVals = Inspect.Values.withOptions(() => ({ expandLevel: 0 }));

	// elementAttributes will be to applied to outermost Inspect div
	const DarkInspect = Inspect.Values.withOptions(() => ({
		theme: 'dark',
		elementAttributes: { style: 'max-width: 500px' }
	}));

	// create another variation that will inherit from the previous one
	const DarkBorderless = DarkInspect.withOptions(() => ({ borderless: true }));

	var div = root();
	var node = $.child(div);

	InspectVals(node, {
		msg: 'i have been configured',
		get data() {
			return data;
		}
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => DarkInspect.Expand0, ($$anchor, DarkInspect_Expand0) => {
		DarkInspect_Expand0($$anchor, {
			msg: 'me too',
			get data() {
				return data;
			}
		});
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => DarkBorderless.Expand1, ($$anchor, DarkBorderless_Expand1) => {
		DarkBorderless_Expand1($$anchor, $.spread_props({ msg: 'i inherit options from DarkInspect' }, () => data));
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}