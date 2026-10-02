import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'children']);
var root = $.from_html(`<optgroup><!></optgroup>`);

export default function Native_select_opt_group($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var optgroup = root();

	$.attribute_effect(optgroup, () => ({ 'data-slot': 'native-select-opt-group', ...restProps }));

	$.customizable_select(optgroup, () => {
		var anchor = $.child(optgroup);
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.snippet(node, () => $$props.children ?? $.noop);
		$.append(anchor, fragment);
	});

	$.bind_this(optgroup, ($$value) => ref($$value), () => ref());
	$.append($$anchor, optgroup);
	$.pop();
}