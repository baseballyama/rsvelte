import * as $ from "svelte/internal/server";
import A from "./A.svelte";
export default function Svelte_component($$renderer, $$props) {
	let { depth = 0, other } = $$props;
	let current = A;
	if (current) {
		$$renderer.push("<!--[-->");
		current($$renderer, {
			label: "x",
			depth
		});
		$$renderer.push("<!--]-->");
	} else {
		$$renderer.push("<!--[!-->");
		$$renderer.push("<!--]-->");
	}
	$$renderer.push(` `);
	if (other ?? A) {
		$$renderer.push("<!--[-->");
		(other ?? A)($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->text ${$.escape(depth)}`);
			},
			$$slots: { default: true }
		});
		$$renderer.push("<!--]-->");
	} else {
		$$renderer.push("<!--[!-->");
		$$renderer.push("<!--]-->");
	}
	$$renderer.push(` `);
	if (depth < 3) {
		$$renderer.push("<!--[0-->");
		Svelte_component($$renderer, { depth: depth + 1 });
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push("<!--[-1-->");
	}
	$$renderer.push(`<!--]-->`);
}
