import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li><button> </button></li>`);
var root_1 = $.from_html(`<ul></ul>`);

export default function Class_each($$anchor) {
	let selected = $.state(1);

	let items = $.proxy([
		{ id: 1, name: 'one', done: false },
		{ id: 2, name: 'two', done: true }
	]);

	var ul = root_1();

	$.each(ul, 21, () => items, (item) => item.id, ($$anchor, item) => {
		var li = root();
		let classes;
		var button = $.child(li);
		var text = $.only_child(button, true);

		$.reset(li);

		$.template_effect(() => {
			classes = $.set_class(li, 1, 'row', null, classes, {
				selected: $.get(item).id === $.get(selected),
				done: $.get(item).done
			});

			$.set_class(button, 1, $.clsx({ current: $.get(item).id === $.get(selected) }));
			$.set_text(text, $.get(item).name);
		});

		$.delegated('click', button, () => $.set(selected, $.get(item).id, true));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.append($$anchor, ul);
}

$.delegate(['click']);