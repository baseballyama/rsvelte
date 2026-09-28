import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { globalOpts } from './globalopts.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'key',
	'disabled'
]);

var root = $.from_html(`<label><!> <input class="opt-tgl-chk svelte-1vvibjn" type="checkbox"/></label>`);

export default function OptionToggleCheck($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	let checked = $.derived(() => Boolean(globalOpts[$$props.key]));

	function onchange(event) {
		globalOpts[$$props.key] = event.currentTarget.checked;
	}

	var label = root();

	$.attribute_effect(label, () => ({ ...rest }), void 0, void 0, void 0, 'svelte-1vvibjn');

	var node = $.child(label);

	$.snippet(node, () => $$props.children ?? $.noop);

	var input = $.sibling(node, 2);

	$.remove_input_defaults(input);
	$.reset(label);

	$.template_effect(() => {
		$.set_attribute(input, 'id', $$props.key);
		$.set_attribute(input, 'name', $$props.key);
		input.disabled = $$props.disabled;
		$.set_checked(input, $.get(checked));
	});

	$.delegated('change', input, onchange);
	$.append($$anchor, label);
	$.pop();
}

$.delegate(['change']);