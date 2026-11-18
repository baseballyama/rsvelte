import * as $ from "svelte/internal/server";
export default function Autofocus_dynamic($$renderer, $$props) {
	let { focus = false, a = true } = $$props;
	let s = true;
	$$renderer.push(`<input${$.attr("autofocus", focus, true)}/> <input autofocus=""/> <input${$.attr("autofocus", true, true)}/> <textarea${$.attr("autofocus", s, true)}></textarea> <div><input${$.attr("autofocus", a, true)} value="x"/></div> <input${$.attributes({
		...{ a },
		autofocus: focus
	}, void 0, void 0, void 0, 4)}/>`);
}
