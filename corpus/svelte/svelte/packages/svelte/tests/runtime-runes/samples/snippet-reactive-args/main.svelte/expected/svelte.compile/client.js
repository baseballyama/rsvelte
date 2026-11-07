import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inner from "./inner.svelte";

const foo = ($$anchor, $$arg0) => {
	let count = () => ($$arg0?.()).count;
	var p = root();
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `snippet: ${count() ?? ''}`));
	$.append($$anchor, p);
};

const bar = ($$anchor, props = $.noop) => {
	Inner($$anchor, $.spread_props(props));
};

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<!> <button>toggle</button> <button>increase count</button>`, 1);

export default function Main($$anchor) {
	let count = $.state(0);
	let show_foo = $.state(true);
	let snippet = $.derived(() => $.get(show_foo) ? foo : bar);
	var fragment_1 = root_1();
	var node = $.first_child(fragment_1);

	$.snippet(node, () => $.get(snippet), () => ({ count: $.get(count) }));

	var button = $.sibling(node, 2);
	var button_1 = $.sibling(button, 2);

	$.delegated('click', button, () => $.set(show_foo, !$.get(show_foo)));
	$.delegated('click', button_1, () => $.update(count));
	$.append($$anchor, fragment_1);
}

$.delegate(['click']);