import * as $ from "svelte/internal/server";
import Exports, { answer, double } from "./exports.svelte";
export default function Import($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const doubled = double(answer);
		const label = answer;
		Exports($$renderer, {});
		$$renderer.push(`<!----> <p>${$.escape(doubled)} ${$.escape(label)}</p>`);
	});
}
