import * as $ from "svelte/internal/server";
import C from "./C.svelte";
export default function Component_events($$renderer) {
	let n = 0;
	let h = () => {};
	function f() {
		n++;
	}
	const make = () => () => {};
	C($$renderer, { a: n });
	$$renderer.push(`<!----> `);
	if (C) {
		$$renderer.push("<!--[-->");
		C($$renderer, {});
		$$renderer.push("<!--]-->");
	} else {
		$$renderer.push("<!--[!-->");
		$$renderer.push("<!--]-->");
	}
}
