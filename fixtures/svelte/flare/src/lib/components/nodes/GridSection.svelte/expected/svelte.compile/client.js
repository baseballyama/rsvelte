import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="text-muted-foreground truncate text-xs"> </p>`);
var root_1 = $.from_html(`<div class="col-start-1 -col-end-1 -mb-1 flex items-baseline gap-2 pt-2.5"><h3 class="text-xs font-semibold text-gray-500 uppercase"> </h3> <!></div>`);

export default function GridSection($$anchor, $$props) {
	$.push($$props, true);

	var div = root_1();
	var h3 = $.child(div);
	var text = $.only_child(h3, true);
	var node = $.sibling(h3, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text_1 = $.only_child(p, true);

			$.template_effect(() => $.set_text(text_1, $$props.props.subtitle));
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($$props.props.subtitle) $$render(consequent);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_text(text, $$props.props.title));
	$.append($$anchor, div);
	$.pop();
}