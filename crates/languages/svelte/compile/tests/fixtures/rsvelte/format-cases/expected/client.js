import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

var root_1 = $.from_html(`<p>none</p>`);

var root_2 = $.from_html(`<section class="list svelte-1ecvz1h"><h2 class="svelte-1ecvz1h"> </h2> <!></section>`);

export default function Format_cases($$anchor, $$props) {
	$.push($$props, true);
	let title = $.prop($$props, 'title', 3, 'List');
	let total = $.derived(() => $$props.items.length * 2 + 1);
	var section = root_2();
	var h2 = $.child(section);
	var text = $.only_child(h2, true);
	var node = $.sibling(h2, 2);
	{
		var consequent = ($$anchor) => {
			var p = root();
			var text_1 = $.only_child(p);
			$.template_effect(() => $.set_text(text_1, `${$.get(total) ?? ''} items, the first one is ${$$props.items[0] ?? ''} and there is a long tail of text here`));
			$.append($$anchor, p);
		};
		var alternate = ($$anchor) => {
			var p_1 = root_1();
			$.append($$anchor, p_1);
		};
		$.if(node, ($$render) => {
			if ($$props.items.length > 0) $$render(consequent); else $$render(alternate, -1);
		});
	}
	$.reset(section);
	$.template_effect(() => {
		$.set_attribute(section, 'data-count', $.get(total));
		$.set_text(text, title());
	});
	$.append($$anchor, section);
	$.pop();
}
