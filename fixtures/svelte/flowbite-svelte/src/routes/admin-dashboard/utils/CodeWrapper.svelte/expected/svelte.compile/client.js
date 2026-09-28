import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { codewrapper } from "./theme";

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div><!> <!></div>`);

export default function CodeWrapper($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(codewrapper),
		base = $.derived(() => $.get($$d).base),
		inner = $.derived(() => $.get($$d).inner);

	var div = root_1();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var node_1 = $.child(div_1);

			$.snippet(node_1, () => $$props.children);
			$.reset(div_1);
			$.template_effect(($0) => $.set_class(div_1, 1, $0), [() => $.clsx($.get(inner)({ class: $$props.innerClass }))]);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = $.comment();
			var node_3 = $.first_child(fragment);

			$.snippet(node_3, () => $$props.codeblock);
			$.append($$anchor, fragment);
		};

		$.if(node_2, ($$render) => {
			if ($$props.codeblock) $$render(consequent_1);
		});
	}

	$.reset(div);
	$.template_effect(($0) => $.set_class(div, 1, $0), [() => $.clsx($.get(base)({ class: $$props.class }))]);
	$.append($$anchor, div);
	$.pop();
}