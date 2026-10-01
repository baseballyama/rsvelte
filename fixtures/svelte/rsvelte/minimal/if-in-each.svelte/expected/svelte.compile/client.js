import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<s> </s>`);
var root_1 = $.from_html(`<b> </b>`);

export default function If_in_each($$anchor) {
	let tasks = $.proxy([{ text: 'write', done: true }, { text: 'test', done: false }]);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => tasks, $.index, ($$anchor, task) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		{
			var consequent = ($$anchor) => {
				var s = root();
				var text = $.only_child(s, true);

				$.template_effect(() => $.set_text(text, $.get(task).text));
				$.append($$anchor, s);
			};

			var alternate = ($$anchor) => {
				var b = root_1();
				var text_1 = $.only_child(b, true);

				$.template_effect(() => $.set_text(text_1, $.get(task).text));
				$.append($$anchor, b);
			};

			$.if(node_1, ($$render) => {
				if ($.get(task).done) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}