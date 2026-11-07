import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <br/> <!>`, 1);

export default function Main($$anchor) {
	const tags = [{ t: 'div', content: 'hello world' }, { t: 'input' }];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => tags, $.index, ($$anchor, tag) => {
		$.next();

		var fragment_1 = root();
		var text = $.first_child(fragment_1);
		var node_1 = $.sibling(text, 3);

		$.element(node_1, () => $.get(tag).t, false, ($$element, $$anchor) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			{
				var consequent = ($$anchor) => {
					var text_1 = $.text();

					$.template_effect(() => $.set_text(text_1, $.get(tag).content));
					$.append($$anchor, text_1);
				};

				$.if(node_2, ($$render) => {
					if ($.get(tag).t !== 'input') $$render(consequent);
				});
			}

			$.append($$anchor, fragment_2);
		});

		$.template_effect(() => $.set_text(text, `${$.get(tag).t ?? ''} `));
		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}