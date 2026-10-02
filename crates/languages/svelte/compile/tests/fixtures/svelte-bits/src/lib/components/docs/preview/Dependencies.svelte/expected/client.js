import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="svelte-1c2tki4"> </span>`);
var root_1 = $.from_html(`<div class="dependencies-section svelte-1c2tki4"><h2 class="demo-title-extra">Dependencies</h2> <div class="demo-details svelte-1c2tki4"></div></div>`);

export default function Dependencies($$anchor, $$props) {
	$.push($$props, true);

	let dependencyList = $.prop($$props, 'dependencyList', 19, () => []);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root_1();
			var div_1 = $.sibling($.child(div), 2);

			$.each(div_1, 20, dependencyList, (dependency) => dependency, ($$anchor, dependency) => {
				var span = root();
				var text = $.only_child(span, true);

				$.template_effect(() => $.set_text(text, dependency));
				$.append($$anchor, span);
			});

			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (dependencyList().length > 0) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}