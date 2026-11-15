import * as $ from "svelte/internal/server";
export default function Ambient_and_hoisted_names_are_not_known($$renderer, $$props) {
	let { $$slots, $$events, ...p } = $$props;
	if (p) {
		var real = "x";
		{
			var deep = 1;
		}
	}
	var top = "t";
	$$renderer.push(`<b>${$.escape(f())}</b><i>${$.escape(C)}</i><s>${$.escape(v)}</s><u>${$.escape(real)}</u><span>${$.escape(deep)}</span><em>t</em><q>${$.escape(typeof injected)}</q>`);
}
