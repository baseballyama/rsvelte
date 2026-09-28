import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inner from './Inner.svelte';

const foo = ($$anchor) => {
	var p = root();

	$.append($$anchor, p);
};

const bar = ($$anchor) => {
	var p_1 = root_1();

	$.append($$anchor, p_1);
};

var root = $.from_html(`<p>foo</p>`);
var root_1 = $.from_html(`<p>bar</p>`);
var root_2 = $.from_html(`<!> <button>show bar</button>`, 1);

export default function Main($$anchor) {
	let show_foo = $.state(true);
	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => $.get(show_foo) ? foo : bar);

		Inner(node, {
			get snippet() {
				return $.get($0);
			}
		});
	}

	var button = $.sibling(node, 2);

	$.event('click', button, () => $.set(show_foo, false));
	$.append($$anchor, fragment);
}