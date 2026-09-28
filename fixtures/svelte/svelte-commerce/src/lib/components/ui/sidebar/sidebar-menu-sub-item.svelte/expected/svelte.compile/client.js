import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'children']);
var root = $.from_html(`<li><!></li>`);

export default function Sidebar_menu_sub_item($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var li = root();

	$.attribute_effect(li, () => ({ 'data-sidebar': 'menu-sub-item', ...restProps }));

	var node = $.child(li);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(li);
	$.bind_this(li, ($$value) => ref($$value), () => ref());
	$.append($$anchor, li);
	$.pop();
}