import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li><button>Delete</button> <!></li>`);
var root_1 = $.from_html(`<ul></ul>`);

export default function Main($$anchor) {
	let entries = $.state($.proxy([
		{ id: 'a', subitems: ['a'] },
		{ id: 'b', subitems: ['b'] },
		{ id: 'c', subitems: ['c'] },
		{ id: 'd', subitems: ['d'] }
	]));

	function onDeleteEntry(entry) {
		$.set(entries, $.get(entries).filter((innerEntry) => innerEntry.id !== entry.id), true);
	}

	var ul = root_1();

	$.each(ul, 21, () => $.get(entries), $.index, ($$anchor, entry) => {
		var li = root();
		var button = $.child(li);
		var text = $.sibling(button);
		var node = $.sibling(text);

		$.each(node, 17, () => $.get(entry).subitems, $.index, ($$anchor, subitem) => {
			$.next();

			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, $.get(subitem)));
			$.append($$anchor, text_1);
		});

		$.reset(li);
		$.template_effect(() => $.set_text(text, ` ${$.get(entry).id ?? ''} `));
		$.event('click', button, () => onDeleteEntry($.get(entry)));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.append($$anchor, ul);
}