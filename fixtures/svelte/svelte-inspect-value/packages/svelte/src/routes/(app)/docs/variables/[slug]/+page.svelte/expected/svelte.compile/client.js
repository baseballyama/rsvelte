import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a> </a> <hr/>`, 1);
var root_1 = $.from_html(`<div class="toc"></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root_1();

			$.each(div, 21, () => $$props.data.meta.children, ([id, title]) => id, ($$anchor, $$item) => {
				var $$array = $.derived(() => $.to_array($.get($$item), 2));
				let id = () => $.get($$array)[0];
				let title = () => $.get($$array)[1];
				var fragment_1 = root();
				var a = $.first_child(fragment_1);
				var text = $.only_child(a, true);

				$.next(2);

				$.template_effect(() => {
					$.set_attribute(a, 'href', `#${id() ?? ''}`);
					$.set_text(text, title());
				});

				$.append($$anchor, fragment_1);
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.data.meta.children) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => $$props.data.content, ($$anchor, data_content) => {
		data_content($$anchor, {});
	});

	$.append($$anchor, fragment);
	$.pop();
}