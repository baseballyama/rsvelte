import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createPageTitle } from '$doclib/util.js';

var root = $.from_html(`<a style="font-weight: bold;"> </a>`);
var root_1 = $.from_html(`<a> </a> <hr/>`, 1);
var root_2 = $.from_html(`<div class="toc"><!> <!></div>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const title = $.derived(() => $$props.data.meta?.title?.[1]);
	var fragment = root_3();

	$.head('1w33aon', ($$anchor) => {
		$.deferred_template_effect(
			($0) => {
				$.document.title = $0 ?? '';
			},
			[
				() => createPageTitle($.get(title) ? `type ${$.get(title)}` : 'Type')
			]
		);
	});

	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_2();
			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					var a = root();
					var text = $.only_child(a, true);

					$.template_effect(() => {
						$.set_attribute(a, 'href', `#${$$props.data.meta.title[0] ?? ''}`);
						$.set_text(text, $$props.data.meta.title[1]);
					});

					$.append($$anchor, a);
				};

				$.if(node_1, ($$render) => {
					if ($$props.data.meta.title) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			$.each(node_2, 17, () => $$props.data.meta.children, ([id, title]) => id, ($$anchor, $$item, $$index, $$array) => {
				var $$array_1 = $.derived(() => $.to_array($.get($$item), 2));
				let id = () => $.get($$array_1)[0];
				let title = () => $.get($$array_1)[1];
				var fragment_1 = root_1();
				var a_1 = $.first_child(fragment_1);
				var text_1 = $.only_child(a_1);

				$.next(2);

				$.template_effect(() => {
					$.set_attribute(a_1, 'href', `#${id() ?? ''}`);
					$.set_text(text_1, `- ${title() ?? ''}`);
				});

				$.append($$anchor, fragment_1);
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.data.meta.children) $$render(consequent_1);
		});
	}

	var node_3 = $.sibling(node, 2);

	$.component(node_3, () => $$props.data.content, ($$anchor, data_content) => {
		data_content($$anchor, {});
	});

	$.append($$anchor, fragment);
	$.pop();
}