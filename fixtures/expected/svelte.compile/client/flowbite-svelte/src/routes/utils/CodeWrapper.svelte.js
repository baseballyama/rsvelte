import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { codewrapper } from "./theme";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'codeblock',
	'innerClass',
	'codeClass',
	'class'
]);

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div><!> <!></div>`);

export default function CodeWrapper($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	const $$d = $.derived(codewrapper),
		base = $.derived(() => $.get($$d).base),
		inner = $.derived(() => $.get($$d).inner);

	const codeCls = $.derived(() => $$props.children ? "border-t border-gray-200 dark:border-gray-600" : "");
	var div = root_1();

	$.attribute_effect(div, ($0) => ({ ...restProps, class: $0 }), [() => $.get(base)({ class: $$props.class })]);

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
			var div_2 = root();
			var node_3 = $.child(div_2);

			$.snippet(node_3, () => $$props.codeblock);
			$.reset(div_2);
			$.template_effect(() => $.set_class(div_2, 1, `${$.get(codeCls) ?? ''} ${$$props.codeClass ?? ''}`));
			$.append($$anchor, div_2);
		};

		$.if(node_2, ($$render) => {
			if ($$props.codeblock) $$render(consequent_1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}