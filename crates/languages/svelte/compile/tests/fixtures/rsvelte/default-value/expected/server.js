import * as $ from "svelte/internal/server";
export default function Default_value($$renderer) {
	let d = "y";
	$$renderer.push(`<input${$.attributes({
		value: "x",
		defaultvalue: d
	}, void 0, void 0, void 0, 4)}/> <input${$.attributes({ defaultvalue: d }, void 0, void 0, void 0, 4)}/> <input${$.attributes({
		type: "checkbox",
		checked: true,
		defaultchecked: false
	}, void 0, void 0, void 0, 4)}/> <input${$.attributes({
		type: "checkbox",
		defaultchecked: false
	}, void 0, void 0, void 0, 4)}/> <textarea>content</textarea> <textarea></textarea>`);
}
