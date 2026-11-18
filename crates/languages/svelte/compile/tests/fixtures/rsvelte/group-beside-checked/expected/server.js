import * as $ from "svelte/internal/server";
export default function Group_beside_checked($$renderer, $$props) {
	let g = void 0;
	let t = "a";
	let { p } = $$props;
	$$renderer.push(`<input type="radio"${$.attr("value", t)}${$.attr("checked", t === g, true)}${$.attr("checked", g === t, true)}/> <input${$.attributes({
		type: "checkbox",
		value: t,
		checked: t === g,
		checked: g.includes(t),
		...p
	}, void 0, void 0, void 0, 4)}/> <input type="checkbox"${$.attr("checked", true, true)}/>`);
}
