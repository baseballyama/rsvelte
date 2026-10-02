import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<legend class="svelte-19pj2h0"> </legend>`);
var root_1 = $.from_html(`<fieldset><!> <!></fieldset>`);

export default function Fieldset($$anchor, $$props) {
	let align = $.prop($$props, 'align', 3, 'left'),
		legend = $.prop($$props, 'legend', 3, undefined),
		nowrap = $.prop($$props, 'nowrap', 3, false);

	var fieldset = root_1();
	let classes;
	var node = $.child(fieldset);

	{
		var consequent = ($$anchor) => {
			var legend_1 = root();
			var text = $.only_child(legend_1, true);

			$.template_effect(() => $.set_text(text, legend()));
			$.append($$anchor, legend_1);
		};

		$.if(node, ($$render) => {
			if (legend()) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.reset(fieldset);
	$.template_effect(() => classes = $.set_class(fieldset, 1, $.clsx(align()), 'svelte-19pj2h0', classes, { nowrap: nowrap() }));
	$.append($$anchor, fieldset);
}