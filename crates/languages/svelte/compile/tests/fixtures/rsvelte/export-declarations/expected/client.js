import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(` <button> </button>`, 1);
export default function Export_declarations($$anchor, $$props) {
	$.push($$props, true);
	const array = [
		1,
		2,
		3,
		[4]
	];
	const [a, b, c, [d]] = array;
	const { p, q: r, ...s } = {
		p: 1,
		q: 2
	};
	class Foo {}
	let x = $.state(1);
	var $$exports = {
		a,
		b,
		c,
		d,
		p,
		r,
		s,
		get Foo() {
			return Foo;
		},
		set Foo($$value) {
			Foo = $$value;
		}
	};
	$.next();
	var fragment = root();
	var text = $.first_child(fragment);
	var button = $.sibling(text);
	var text_1 = $.only_child(button, true);
	$.template_effect(() => {
		$.set_text(text, `${$.get(x) ?? ""} ${a ?? ""} `);
		$.set_text(text_1, p);
	});
	$.delegated("click", button, () => $.update(x));
	$.append($$anchor, fragment);
	return $.pop($$exports);
}
$.delegate(["click"]);
