import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from 'svelte-inspect-value';
import values from './values';
import { globalOpts } from '@components/global-opts/globalopts.svelte';

var root = $.from_html(`<!> <div class="input-row"><label>No Animation <input type="checkbox"/></label> <label>Animation Rate <input type="number"/></label> <label>Flash On Update <input type="checkbox"/></label></div>`, 1);

export default function Animation($$anchor, $$props) {
	$.push($$props, true);

	let props = $.proxy({ noanimate: false, animRate: 1, flashOnUpdate: true });
	let num = $.state(0);

	$.user_effect(() => {
		let int = window.setInterval(
			() => {
				$.update(num);
			},
			1200
		);

		return () => {
			window.clearInterval(int);
		};
	});

	var fragment = root();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => ({
			...values,
			updates: $.get(num),
			duration: (250 / props.animRate).toFixed(2) + 'ms'
		}));

		Inspect(node, $.spread_props({ heading: true }, () => props, {
			class: 'not-content mt',
			get theme() {
				return globalOpts.theme;
			},

			get borderless() {
				return globalOpts.borderless;
			},

			get values() {
				return $.get($0);
			},
			expandLevel: 0
		}));
	}

	var div = $.sibling(node, 2);
	var label = $.child(div);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.sibling($.child(label_1));

	$.remove_input_defaults(input_1);
	$.set_attribute(input_1, 'min', 0.25);
	$.set_attribute(input_1, 'step', 0.25);
	$.reset(label_1);

	var label_2 = $.sibling(label_1, 2);
	var input_2 = $.sibling($.child(label_2));

	$.remove_input_defaults(input_2);
	$.reset(label_2);
	$.reset(div);
	$.bind_checked(input, () => props.noanimate, ($$value) => props.noanimate = $$value);
	$.bind_value(input_1, () => props.animRate, ($$value) => props.animRate = $$value);
	$.bind_checked(input_2, () => props.flashOnUpdate, ($$value) => props.flashOnUpdate = $$value);
	$.append($$anchor, fragment);
	$.pop();
}