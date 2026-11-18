import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<div> </div>`);
export default function Export_specifiers_unwritten($$anchor, $$props) {
	$.push($$props, true);
	let p = $.prop($$props, "p", 7, 1);
	let a = 1;
	let s = $.state(0);
	let f = () => 1;
	class K {}
	let _class = "";
	var $$exports = {
		get a() {
			return a;
		},
		set a($$value) {
			a = $$value;
		},
		get s() {
			return $.get(s);
		},
		set s($$value) {
			$.set(s, $.proxy($$value));
		},
		get p() {
			return p();
		},
		set p($$value) {
			p($$value);
		},
		get f() {
			return f;
		},
		set f($$value) {
			f = $$value;
		},
		get K() {
			return K;
		},
		set K($$value) {
			K = $$value;
		},
		get class() {
			return _class;
		},
		set class($$value) {
			_class = $$value;
		}
	};
	var div = root();
	var text = $.only_child(div);
	$.template_effect(() => {
		$.set_class(div, 1, $.clsx(_class));
		$.set_text(text, `${a ?? ""} ${$.get(s) ?? ""} ${p() ?? ""}`);
	});
	$.delegated("click", div, f);
	$.append($$anchor, div);
	return $.pop($$exports);
}
$.delegate(["click"]);
