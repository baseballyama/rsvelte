import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = $.prop($$props, 'count', 7, 0);

	var $$exports = {
		get count() {
			return count();
		},

		set count($$value) {
			count($$value);
		}
	};

	var p = root();
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, count()));
	$.append($$anchor, p);

	return $.pop($$exports);
}