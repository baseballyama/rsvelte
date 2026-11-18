import * as $ from "svelte/internal/server";
function s($$renderer, { p = q, q }, r = q, t) {
	$$renderer.push(`<!---->${$.escape(p)}${$.escape(q)}${$.escape(r)}${$.escape(t)}`);
}
export default function Reads_before_transform($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items } = $$props;
		if (items) {
			$$renderer.push("<!--[0-->");
			const a = b;
			const f = () => b;
			const b = items.length;
			$$renderer.push(`<h1>hello ${$.escape(a)} ${$.escape(f())}</h1>`);
		} else {
			$$renderer.push("<!--[-1-->");
		}
		$$renderer.push(`<!--]--> <!--[-->`);
		const each_array = $.ensure_array_like(items);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { a, b = c, c, d = a, e = e } = each_array[$$index];
			$$renderer.push(`<!---->${$.escape(a)}${$.escape(b)}${$.escape(c)}${$.escape(d)}${$.escape(e)}`);
		}
		$$renderer.push(`<!--]--> <!--[-->`);
		const each_array_1 = $.ensure_array_like(items);
		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let [x, y = z, z = x] = each_array_1[$$index_1];
			$$renderer.push(`<!---->${$.escape(x)}${$.escape(y)}${$.escape(z)}`);
		}
		$$renderer.push(`<!--]--> `);
		s($$renderer, items);
		$$renderer.push(`<!---->`);
	});
}
