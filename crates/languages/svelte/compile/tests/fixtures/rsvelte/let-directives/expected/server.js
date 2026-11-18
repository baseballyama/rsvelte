import * as $ from "svelte/internal/server";
import C from "./C.svelte";
export default function Let_directives($$renderer) {
	let k = 1;
	C($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { item, index: i, pair: { a, b: [c], ...rest } }) => {
				$$renderer.push(`<!--[-->`);
				const each_array = $.ensure_array_like(item);
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let x = each_array[$$index];
					$$renderer.push(`<p>${$.escape(x)} ${$.escape(i)} ${$.escape(a)} ${$.escape(c)} ${$.escape(rest.d)} ${$.escape(k)}</p>`);
				}
				$$renderer.push(`<!--]-->`);
			},
			named: ($$renderer, { x }) => {
				$$renderer.push(`<div slot="named">${$.escape(x)}</div>`);
			},
			f: ($$renderer, { y: { z } }) => {
				{
					$$renderer.push(`${$.escape(z)}`);
				}
			},
			comp: ($$renderer, { w }) => {
				C($$renderer, {
					slot: "comp",
					foo: w,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(w)}`);
					},
					$$slots: { default: true }
				});
			},
			consts: ($$renderer, { v }) => {
				const twice = v * 2;
				$$renderer.push(`<p slot="consts">${$.escape(twice)}</p>`);
			}
		}
	});
	$$renderer.push(`<!----> `);
	C($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: { default: ($$renderer, { v }) => {
			{
				$$renderer.push(`${$.escape(v)}`);
			}
		} }
	});
	$$renderer.push(`<!----> `);
	C($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: { default: ($$renderer, { u }) => {
			{
				$$renderer.push(`${$.escape(u)}`);
			}
		} }
	});
	$$renderer.push(`<!---->`);
}
