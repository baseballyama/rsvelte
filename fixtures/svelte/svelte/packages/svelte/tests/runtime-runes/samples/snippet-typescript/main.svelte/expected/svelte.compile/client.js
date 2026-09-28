import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const counter1 = ($$anchor, c = $.noop) => {
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, c()));
	$.append($$anchor, text);
};

const counter2 = ($$anchor, $$arg0) => {
	let c = () => ($$arg0?.()).c;

	$.next();

	var text_1 = $.text();

	$.template_effect(() => $.set_text(text_1, c()));
	$.append($$anchor, text_1);
};

const counter3 = ($$anchor, c = $.noop) => {
	$.next();

	var text_2 = $.text();

	$.template_effect(() => $.set_text(text_2, c()));
	$.append($$anchor, text_2);
};

const counter4 = ($$anchor, $$arg0) => {
	let c = $.derived_safe_equal(() => $.fallback($$arg0?.(), 4));

	$.next();

	var text_3 = $.text();

	$.template_effect(() => $.set_text(text_3, $.get(c)));
	$.append($$anchor, text_3);
};

const counter5 = ($$anchor, $$arg0) => {
	let c = $.derived_safe_equal(() => $.fallback($$arg0?.(), 5));

	$.next();

	var text_4 = $.text();

	$.template_effect(() => $.set_text(text_4, $.get(c)));
	$.append($$anchor, text_4);
};

const counter6 = ($$anchor, c = $.noop, d = $.noop) => {
	$.next();

	var text_5 = $.text();

	$.template_effect(() => $.set_text(text_5, `${c() ?? ''}${d() ?? ''}`));
	$.append($$anchor, text_5);
};

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Main($$anchor) {
	var fragment_6 = root();
	var node = $.first_child(fragment_6);

	counter1(node, () => 1);

	var node_1 = $.sibling(node, 2);

	counter2(node_1, () => ({ c: 2 }));

	var node_2 = $.sibling(node_1, 2);

	counter3(node_2, () => 3);

	var node_3 = $.sibling(node_2, 2);

	counter4(node_3);

	var node_4 = $.sibling(node_3, 2);

	counter5(node_4);

	var node_5 = $.sibling(node_4, 2);

	counter6(node_5, () => 6, () => 'a');
	$.append($$anchor, fragment_6);
}