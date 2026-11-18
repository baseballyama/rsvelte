import * as $ from "svelte/internal/server";
import C from "./C.svelte";
export default function Component_attachments($$renderer, $$props) {
	let x = 1;
	let { D } = $$props;
	const a = (n) => {};
	C($$renderer, {});
	$$renderer.push(`<!----> `);
	C($$renderer, {
		a: 1,
		b: x
	});
	$$renderer.push(`<!----> `);
	if (D) {
		$$renderer.push("<!--[-->");
		D($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->child`);
			},
			$$slots: { default: true }
		});
		$$renderer.push("<!--]-->");
	} else {
		$$renderer.push("<!--[!-->");
		$$renderer.push("<!--]-->");
	}
	$$renderer.push(` `);
	if (D) {
		$$renderer.push("<!--[-->");
		D($$renderer, {});
		$$renderer.push("<!--]-->");
	} else {
		$$renderer.push("<!--[!-->");
		$$renderer.push("<!--]-->");
	}
	$$renderer.push(` `);
	if (x) {
		$$renderer.push("<!--[0-->");
		C($$renderer, $.spread_props([{ y: 1 }]));
	} else {
		$$renderer.push("<!--[-1-->");
	}
	$$renderer.push(`<!--]--> <button>+</button> `);
	C($$renderer, {});
	$$renderer.push(`<!---->`);
}
