import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a>foo</a> <a>foo</a>`, 1);

export default function Main($$anchor, $$props) {
	var fragment = root();
	var a = $.first_child(fragment);
	var a_1 = $.sibling(a, 2);

	$.attribute_effect(a_1, () => ({ ...{ href: $$props.browser ? '/foo' : '/bar' } }));
	$.template_effect(() => $.set_attribute(a, 'href', $$props.browser ? '/foo' : '/bar'));
	$.append($$anchor, fragment);
}