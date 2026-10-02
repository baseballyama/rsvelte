import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './child.svelte';

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
var root_2 = $.from_html(`<!> <button>toggle</button>`, 1);

export default function Main($$anchor) {
	let snippet = $.state('foo');
	let show = $.state(false);
	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => ({ foo, bar }));
		let $1 = $.derived(() => $.get(show) ? foo : undefined);

		Child(node, {
			get snippets() {
				return $.get($0);
			},

			get snippet() {
				return $.get(snippet);
			},

			get optional() {
				return $.get($1);
			}
		});
	}

	var button = $.sibling(node, 2);

	$.event('click', button, () => {
		$.set(snippet, 'bar');
		$.set(show, true);
	});

	$.append($$anchor, fragment);
}