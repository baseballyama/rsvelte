import * as $ from "svelte/internal/server";
import C from "./C.svelte";
export default function Named_slots($$renderer) {
	let x = 1;
	{
		function foo($$renderer) {
			$$renderer.push(`<!---->f`);
		}
		C($$renderer, {
			foo,
			children: ($$renderer) => {
				$$renderer.push(`<!---->hello ${$.escape(x)}`);
			},
			$$slots: {
				foo: true,
				"0": ($$renderer) => {
					$$renderer.push(`<span slot="0"${$.attr_class("", void 0, { "x": x })}>s</span>`);
				},
				"1": ($$renderer) => {
					C($$renderer, {
						slot: "1",
						a: x
					});
				},
				default: true,
				a: ($$renderer) => {
					$$renderer.push(`<div slot="a">${$.escape(x)}</div>`);
				}
			}
		});
	}
	$$renderer.push(`<!----> `);
	C($$renderer, { $$slots: {
		b: ($$renderer) => {
			{
				$$renderer.push(`<span>${$.escape(x)}</span>`);
			}
		},
		c: ($$renderer) => {
			{
				$$renderer.push(`<svg><rect></rect></svg>`);
			}
		}
	} });
	$$renderer.push(`<!----> `);
	C($$renderer, {
		children: ($$renderer) => {
			{
				$$renderer.push(`plain ${$.escape(x)}`);
			}
		},
		$$slots: { default: true }
	});
	$$renderer.push(`<!----> <button></button>`);
}
