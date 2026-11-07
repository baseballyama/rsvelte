import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from 'svelte-inspect-value';
import values from './values';
import { globalOpts } from '@components/global-opts/globalopts.svelte';

var root = $.from_html(`<div class="input-row"><label>expandLevel <input type="number" class="svelte-1eay6v5"/></label> <label>Set expandPaths <input type="checkbox" class="svelte-1eay6v5"/></label></div> <!>`, 1);

export default function ExpandLevel($$anchor, $$props) {
	$.push($$props, true);

	let expandLevel = $.state(0);
	let expandPaths = $.state($.proxy([]));
	let display = $.state(0);

	let props = $.derived(() => ({
		expandLevel: $.get(expandLevel),
		expandPaths: $.get(expandPaths)
	}));

	var fragment = root();
	var div = $.first_child(fragment);
	var label = $.child(div);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);
	$.set_attribute(input, 'min', 0);
	$.set_attribute(input, 'max', 30);
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.sibling($.child(label_1));

	$.remove_input_defaults(input_1);
	$.reset(label_1);
	$.reset(div);

	var node = $.sibling(div, 2);

	$.key(node, () => $.get(display), ($$anchor) => {
		{
			let $0 = $.derived(() => ({
				arr: values.veryNested,
				levelOne: {
					a: 'a',
					b: 'b',
					levelTwo: {
						a: 'a',
						b: 'b',
						levelThree: { a: 'a', b: 'b', levelFour: { msg: 'end' } }
					}
				},
				expandPathsValue: $.get(expandPaths)
			}));

			Inspect($$anchor, $.spread_props(() => $.get(props), {
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
				showPreview: true
			}));
		}
	});

	$.template_effect(
		($0) => {
			$.set_value(input, $.get(expandLevel));
			$.set_checked(input_1, $0);
		},
		[() => Boolean($.get(expandPaths).length)]
	);

	$.delegated('change', input, (e) => {
		const value = e.currentTarget.valueAsNumber;

		$.set(expandLevel, value, true);
		$.update(display);
	});

	$.delegated('change', input_1, (e) => {
		const checked = e.currentTarget.checked;

		if (checked) {
			$.set(expandLevel, 0);
			$.set(expandPaths, ['levelOne.levelTwo.levelThree', 'arr.0.0'], true);
		} else {
			$.set(expandPaths, [], true);
		}

		$.update(display);
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['change']);