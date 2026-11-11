import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<!> <div><!></div> <!>`, 1);
export default function Render_dynamic($$anchor, $$props) {
	$.push($$props, true);
	var fragment = root();
	var node = $.first_child(fragment);
	$.snippet(node, () => $$props.header);
	var div = $.sibling(node, 2);
	var node_1 = $.child(div);
	$.snippet(node_1, () => $$props.footer ?? $.noop, () => $$props.items);
	$.reset(div);
	var node_2 = $.sibling(div, 2);
	$.each(node_2, 17, () => $$props.items, $.index, ($$anchor, item) => {
		var fragment_1 = $.comment();
		var node_3 = $.first_child(fragment_1);
		$.snippet(node_3, () => $.get(item).view);
		$.append($$anchor, fragment_1);
	});
	$.append($$anchor, fragment);
	$.pop();
}
