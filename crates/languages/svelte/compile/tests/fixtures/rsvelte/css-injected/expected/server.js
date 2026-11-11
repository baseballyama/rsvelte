import * as $ from "svelte/internal/server";
const $$css = {
	hash: "svelte-49oqy8",
	code: ".a.svelte-49oqy8 {color:red;}p.svelte-49oqy8:hover {color:blue}"
};
export default function Css_injected($$renderer, $$props) {
	$$renderer.global.css.add($$css);
	let { children } = $$props;
	let x = 1;
	$$renderer.push(`<p class="a svelte-49oqy8">${$.escape(x)}</p> `);
	children?.($$renderer);
	$$renderer.push(`<!---->`);
}
