import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AllTypes from '$doclib/examples/AllTypes.svelte';

var root = $.from_html(
	`<div class="flex"><label>text color <input type="color"/></label> <label>bg <input type="color"/></label> <label>fg <input type="color"/></label></div> <div><!></div> --text-search-highlight-color="hotpink" --text-search-highlight-fg-color="black"
--text-search-highlight-decoration="underline dotted black" --text-search-highlight-border="1px
dotted green"`,
	1
);

export default function _page($$anchor) {
	let color = $.state('#ffffff');
	let overrides = $.proxy({ background: '#000000', fg: '#FFFFFF' });
	var fragment = root();

	var // let backgroundColor = $state('transparent')
	div = $.first_child(fragment);

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
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node = $.child(div_1);

	AllTypes(node, { theme: 'plain' });
	$.reset(div_1);
	$.next();
	$.template_effect(() => $.set_style(div_1, `color: ${$.get(color) ?? ''};padding: 2em;`));
	$.bind_value(input, () => $.get(color), ($$value) => $.set(color, $$value));
	$.bind_value(input_1, () => overrides.background, ($$value) => overrides.background = $$value);
	$.bind_value(input_2, () => overrides.fg, ($$value) => overrides.fg = $$value);
	$.append($$anchor, fragment);
}