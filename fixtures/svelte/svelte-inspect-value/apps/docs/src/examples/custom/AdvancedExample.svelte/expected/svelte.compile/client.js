import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect, { addComponent } from 'svelte-inspect-value';
import HexString from './HexString.svelte';

var root = $.from_html(`<!> <div class="input-row"><label>show string value <input type="checkbox"/></label> <label>use default <input type="checkbox"/></label></div>`, 1);

export default function AdvancedExample($$anchor, $$props) {
	$.push($$props, true);

	let showString = $.state(false);
	let useDefault = $.state(false);

	const components = {
		// Using the exported helper function enables proper typing for props
		// NOTE: the returned props can be considered overrides for props passed by Inspect
		// and does not need to be complete
		string: addComponent(
			HexString,
			// Optional props transform.
			// The custom prop `showString` will be reactive as this used $derived
			(props) => ({ showString: $.get(showString), value: props.value }),
			// Optional predicate determines if custom component should be used (if true)
			// Uses default component if false
			(props) => props.value.startsWith('#') && !$.get(useDefault)
		)
	};

	const value = {
		red: '#FF0000',
		pink: '#FF00FF',
		yella: '#FFFF00',
		notAColor: 'hello'
	};

	var fragment = root();
	var node = $.first_child(fragment);

	Inspect(node, {
		class: 'not-content mt',
		name: 'colors',
		get value() {
			return value;
		},

		get customComponents() {
			return components;
		}
	});

	var div = $.sibling(node, 2);
	var label = $.child(div);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.sibling($.child(label_1));

	$.remove_input_defaults(input_1);
	$.reset(label_1);
	$.reset(div);
	$.bind_checked(input, () => $.get(showString), ($$value) => $.set(showString, $$value));
	$.bind_checked(input_1, () => $.get(useDefault), ($$value) => $.set(useDefault, $$value));
	$.append($$anchor, fragment);
	$.pop();
}