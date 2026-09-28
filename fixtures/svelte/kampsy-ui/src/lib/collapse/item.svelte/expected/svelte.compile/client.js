import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from "svelte";

var root = $.from_html(`<div><!></div>`);

export default function Item($$anchor, $$props) {
	$.push($$props, true);

	let size = $.prop($$props, 'size', 3, "large"),
		value = $.prop($$props, 'value', 3, ""),
		klass = $.prop($$props, 'class', 3, ""),
		defaultExpanded = $.prop($$props, 'defaultExpanded', 3, false);

	setContext("collapseItem", {
		size: size(),
		value: value(),
		defaultExpanded: defaultExpanded()
	});

	var div = root();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, `w-full ${klass() ?? ''}`));
	$.append($$anchor, div);
	$.pop();
}