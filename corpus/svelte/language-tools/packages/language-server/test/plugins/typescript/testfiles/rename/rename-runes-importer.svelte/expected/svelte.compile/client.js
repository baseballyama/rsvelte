import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import RenameRunes from "./rename-runes.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Rename_runes_importer($$anchor) {
	let foo = '';
	let bar = $.state('');
	var fragment = root();
	var node = $.first_child(fragment);

	RenameRunes(node, {
		foo,
		get bar() {
			return $.get(bar);
		},

		set bar($$value) {
			$.set(bar, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	RenameRunes(node_1, {
		foo,
		get bar() {
			return $.get(bar);
		},

		set bar($$value) {
			$.set(bar, $$value, true);
		}
	});

	$.append($$anchor, fragment);
}