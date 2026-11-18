import * as $ from "svelte/internal/server";
import Foo from "./Foo.svelte";
export default function Bind_this($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { p = void 0, C } = $$props;
		let el;
		let a = void 0;
		let refs = [];
		let items = [{ el: null }];
		const obj = { x: null };
		$$renderer.push(`<div></div> <span></span> <p></p> <b></b> <!--[-->`);
		const each_array = $.ensure_array_like(items);
		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let item = each_array[i];
			$$renderer.push(`<i></i> <u></u>`);
		}
		$$renderer.push(`<!--]--> <canvas></canvas> `);
		Foo($$renderer, { x: 1 });
		$$renderer.push(`<!----> `);
		if (C) {
			$$renderer.push("<!--[-->");
			C($$renderer, {});
			$$renderer.push("<!--]-->");
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push("<!--]-->");
		}
		$$renderer.push(` <!--[-->`);
		const each_array_1 = $.ensure_array_like([1, 2]);
		for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
			let n = each_array_1[i];
			Foo($$renderer, {});
		}
		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { p });
	});
}
