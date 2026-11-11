import * as $ from "svelte/internal/server";
export default function Export_declarations($$renderer, $$props) {
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
	let x = 1;
	$$renderer.push(`<!---->${$.escape(x)} ${$.escape(a)} <button>${$.escape(p)}</button>`);
	$.bind_props($$props, {
		a,
		b,
		c,
		d,
		p,
		r,
		s,
		Foo
	});
}
