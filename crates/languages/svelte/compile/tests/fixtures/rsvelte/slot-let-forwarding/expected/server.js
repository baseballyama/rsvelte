import * as $ from "svelte/internal/server";
import C from "./C.svelte";
export default function Slot_let_forwarding($$renderer, $$props) {
	C($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);
			$.slot($$renderer, $$props, "default", { foo }, () => {
				$$renderer.push(`${$.escape(foo)}`);
			});
			$$renderer.push(`<!--]-->`);
		},
		$$slots: {
			default: true,
			a: ($$renderer) => {
				$$renderer.push(`<div slot="a"><!--[-->`);
				$.slot($$renderer, $$props, "b", { baz }, null);
				$$renderer.push(`<!--]--></div>`);
			}
		}
	});
}
