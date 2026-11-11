import * as $ from "svelte/internal/server";
export default function Scoped_custom_element($$renderer, $$props) {
	let c = "a";
	let { p } = $$props;
	$$renderer.push(`<my-el class="svelte-md0yph"></my-el> <my-el id="x" class="svelte-md0yph"></my-el> <my-el class="k svelte-md0yph"></my-el> <my-el${$.attr_class($.clsx(c), "svelte-md0yph")}></my-el> <my-el${$.attr_class("svelte-md0yph", void 0, { "on": c })}></my-el> <my-el${$.attributes({ ...p }, "svelte-md0yph", void 0, void 0, 2)}></my-el> <div><my-el${$.attr("a", c)} class="svelte-md0yph"></my-el></div>`);
}
