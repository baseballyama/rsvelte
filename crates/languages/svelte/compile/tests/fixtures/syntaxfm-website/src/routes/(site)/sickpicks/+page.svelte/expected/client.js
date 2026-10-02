import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h3 class="h5"><a> </a> <!></h3> <!>`, 1);
var root_1 = $.from_html(`<main><div><h2 class="h3">Sick Picks</h2> <p class="text-xs">(things we pick that are sick)</p> <!></div></main>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var /**
	 * @typedef {Object} Props
	 * @property {any} data
	 */
	/** @type {Props} */
	main = root_1();

	var div = $.child(main);

	$.set_style(div, '', {}, { 'margin-bottom': '2rem' });

	var node = $.sibling($.child(div), 4);

	$.each(node, 17, () => $$props.data.sickPicks, $.index, ($$anchor, show) => {
		var fragment = root();
		var h3 = $.first_child(fragment);
		var a = $.child(h3);
		var text = $.only_child(a);
		var node_1 = $.sibling(a, 2);

		{
			var consequent = ($$anchor) => {
				var text_1 = $.text();

				$.template_effect(($0) => $.set_text(text_1, `w/ ${$0 ?? ''}`), [() => $.get(show).guests.join(', ')]);
				$.append($$anchor, text_1);
			};

			$.if(node_1, ($$render) => {
				if ($.get(show).guests.length) $$render(consequent);
			});
		}

		$.reset(h3);

		var node_2 = $.sibling(h3, 2);

		$.html(node_2, () => $.get(show).rendered);

		$.template_effect(() => {
			$.set_attribute(a, 'href', `/${$.get(show).number}`);
			$.set_text(text, `#${$.get(show).number ?? ''}`);
		});

		$.append($$anchor, fragment);
	});

	$.reset(div);
	$.reset(main);
	$.append($$anchor, main);
	$.pop();
}