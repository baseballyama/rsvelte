import * as $ from "svelte/internal/server";
export default function Export_specifiers_unwritten($$renderer, $$props) {
	let { p = 1 } = $$props;
	let a = 1;
	let s = 0;
	let f = () => 1;
	class K {}
	let _class = "";
	$$renderer.push(`<div${$.attr_class($.clsx(_class))}>${$.escape(a)} ${$.escape(s)} ${$.escape(p)}</div>`);
	$.bind_props($$props, {
		a,
		s,
		p,
		f,
		K,
		class: _class
	});
}
