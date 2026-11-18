import * as $ from "svelte/internal/server";
import A from "./A.svelte";
export default function Children_prop_beside_content($$renderer) {
	let x = 1;
	A($$renderer, {
		children: "foo",
		$$slots: { default: ($$renderer) => {
			$$renderer.push(`<p>1</p>`);
		} }
	});
	$$renderer.push(`<!----> `);
	A($$renderer, {
		children: 2,
		position: "apart",
		$$slots: { default: ($$renderer) => {
			$$renderer.push(`<b>hi</b>`);
		} }
	});
	$$renderer.push(`<!----> `);
	A($$renderer, {
		children: x,
		$$slots: { default: ($$renderer) => {
			$$renderer.push(`<!---->t`);
		} }
	});
	$$renderer.push(`<!---->`);
}
