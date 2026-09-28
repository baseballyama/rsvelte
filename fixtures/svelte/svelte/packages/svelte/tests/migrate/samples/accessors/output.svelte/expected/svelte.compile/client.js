import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button><!></button>`);

export default function Output($$anchor, $$props) {
	$.push($$props, true);

	let count = $.prop($$props, 'count', 7, 0),
		stuff = $.prop($$props, 'stuff', 7);

	var $$exports = {
		get count() {
			return count();
		},

		set count($$value) {
			count($$value);
		},

		get stuff() {
			return stuff();
		},

		set stuff($$value) {
			stuff($$value);
		}
	};

	var button = root();
	var node = $.child(button);

	$.snippet(node, () => $$props.cool ?? $.noop);
	$.reset(button);
	$.append($$anchor, button);

	return $.pop($$exports);
}