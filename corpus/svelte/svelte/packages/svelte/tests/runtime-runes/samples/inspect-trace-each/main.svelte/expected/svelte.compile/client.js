import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Entry from './Entry.svelte';

var root = $.from_html(`<button>update</button> <!>`, 1);

export default function Main($$anchor) {
	let array = $.state($.proxy([{ id: 1, hi: true }]));
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.each(node, 17, () => $.get(array), (entry) => entry.id, ($$anchor, entry) => {
		Entry($$anchor, {
			get entry() {
				return $.get(entry);
			}
		});
	});

	$.delegated('click', button, () => $.set(array, [{ id: 1, hi: false }], true));
	$.append($$anchor, fragment);
}

$.delegate(['click']);