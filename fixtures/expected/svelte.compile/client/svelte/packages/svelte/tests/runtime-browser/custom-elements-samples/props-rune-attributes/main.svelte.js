import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', '$$host', 'bar', 'b-az']);
var root = $.from_html(`<p> </p> <p> </p> <p> </p>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let bar = $.prop($$props, 'bar', 7),
		baz = $.prop($$props, 'b-az', 7),
		rest = $.rest_props($$props, rest_excludes);

	var $$exports = {
		get bar() {
			return bar();
		},

		set bar($$value) {
			bar($$value);
			$.flush();
		},

		get 'b-az'() {
			return baz();
		},

		set 'b-az'($$value) {
			baz($$value);
			$.flush();
		}
	};

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);
	var p_2 = $.sibling(p_1, 2);
	var text_2 = $.only_child(p_2, true);

	$.template_effect(() => {
		$.set_text(text, $$props.foo);
		$.set_text(text_1, bar());
		$.set_text(text_2, baz());
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}

customElements.define('custom-element', $.create_custom_element(Main, { foo: { attribute: 'foo-bar' }, bar: {}, 'b-az': {} }, [], [], { mode: 'open' }));