import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Main($$anchor) {
	let a = $.proxy([{ text: 'foo' }]);
	let b = $.proxy([{ text: 'foo' }]);
	let text = $.state('foo');

	let c = $.proxy([
		{
			get text() {
				return $.get(text).toUpperCase();
			},

			set text(v) {
				$.set(text, v, true);
			}
		}
	]);

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.each(node, 17, () => a, $.index, ($$anchor, item, i) => {
		var button = root();
		var text_1 = $.only_child(button, true);

		$.template_effect(() => $.set_text(text_1, $.get(item).text));
		$.event('click', button, () => a[i].text = 'bar');
		$.append($$anchor, button);
	});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 17, () => b, $.index, ($$anchor, item, $$index_1) => {
		var button_1 = root();
		var text_2 = $.only_child(button_1, true);

		$.template_effect(() => $.set_text(text_2, $.get(item).text));
		$.event('click', button_1, () => ($.get(item).text = 'bar'));
		$.append($$anchor, button_1);
	});

	var node_2 = $.sibling(node_1, 2);

	$.each(node_2, 17, () => c, $.index, ($$anchor, item, $$index_2) => {
		var button_2 = root();
		var text_3 = $.only_child(button_2, true);

		$.template_effect(() => $.set_text(text_3, $.get(item).text));
		$.event('click', button_2, () => ($.get(item).text = 'bar'));
		$.append($$anchor, button_2);
	});

	$.append($$anchor, fragment);
}