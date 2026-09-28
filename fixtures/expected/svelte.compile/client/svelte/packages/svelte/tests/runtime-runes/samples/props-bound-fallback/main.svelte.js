import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Counter from './Counter.svelte';

var root = $.from_html(`<button> </button> <!>`, 1);

export default function Main($$anchor) {
	let bound = $.state(void 0);
	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var node = $.sibling(button, 2);

	Counter(node, {
		get count() {
			return $.get(bound);
		},

		set count($$value) {
			$.set(bound, $$value, true);
		}
	});

	$.template_effect(() => $.set_text(text, $.get(bound)));
	$.event('click', button, () => $.set(bound, 1));
	$.append($$anchor, fragment);
}