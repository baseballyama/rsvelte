import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'children']);
var root = $.from_html(`<option><!></option>`);

export default function Native_select_option($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var option = root();

	$.attribute_effect(option, () => ({ 'data-slot': 'native-select-option', ...restProps }));

	$.customizable_select(option, () => {
		var anchor = $.child(option);
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.snippet(node, () => $$props.children ?? $.noop);
		$.append(anchor, fragment);
	});

	$.bind_this(option, ($$value) => ref($$value), () => ref());
	$.append($$anchor, option);
	$.pop();
}