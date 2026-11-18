import * as $ from "svelte/internal/server";
import { format } from "./format.js";
function row($$renderer, label, onclick) {
	$$renderer.push(`<button>${$.escape(label)}</button>`);
}
export default function Render_memo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items, header } = $$props;
		let count = 0;
		$$renderer.push(`<div>`);
		row($$renderer, format(items), () => count++);
		$$renderer.push(`<!----></div> `);
		header?.($$renderer, format(count), count);
		$$renderer.push(`<!----> `);
		row($$renderer, `${count}`, format);
		$$renderer.push(`<!---->`);
	});
}
