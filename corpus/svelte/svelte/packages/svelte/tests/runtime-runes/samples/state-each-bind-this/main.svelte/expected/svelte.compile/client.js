import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Paragraph from './Paragraph.svelte';

var root = $.from_html(`<div><!> <button>change</button> <button>delete</button></div>`);

export default function Main($$anchor) {
	let boundParagraphs = $.proxy([]);
	let store = $.proxy([{ id: 1, text: 'b1' }, { id: 2, text: 'b2' }]);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 19, () => store, (text) => text.id, ($$anchor, text, i) => {
		var div = root();
		var node_1 = $.child(div);

		$.bind_this(
			Paragraph(node_1, {
				get text() {
					return $.get(text).text;
				}
			}),
			($$value, i) => boundParagraphs[i] = $$value,
			(i) => boundParagraphs?.[i],
			() => [$.get(i)]
		);

		var button = $.sibling(node_1, 2);
		var button_1 = $.sibling(button, 2);

		$.reset(div);
		$.delegated('click', button, () => boundParagraphs[$.get(i)].changeBackgroundToRed());
		$.delegated('click', button_1, () => store.splice(store.indexOf($.get(text)), 1));
		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);