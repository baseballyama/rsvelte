import * as $ from "svelte/internal/server";
export default function Custom_element_attributes($$renderer, $$props) {
	let { v = 1, o } = $$props;
	let s = 2;
	$$renderer.push(`<my-el a="1"${$.attr("b", v)}${$.attr("c", s)} class="x" style="color: red"></my-el> <lite-youtube videoid="abc"${$.attr("params", `x=${$.stringify(v)}`)}></lite-youtube> <x-foo${$.attributes({
		...o,
		d: s
	}, void 0, void 0, void 0, 2)}><span>${$.escape(s)}</span></x-foo> <x-bar></x-bar> <div is="my-div"${$.attr("title", v)}></div> <x-baz${$.attr("data-a", s)}${$.attr_class("", void 0, { "active": s })}${$.attr_style("", { color: "red" })}></x-baz> <p title="t" is="my-p"${$.attr("data-x", Math.max(v, 1))} foobar="Q"></p> <x-qux${$.attributes({
		...o,
		foobar: "Q"
	}, void 0, void 0, void 0, 2)}></x-qux>`);
}
