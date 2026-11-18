import * as $ from "svelte/internal/server";
import List from "./List.svelte";
export default function Snippet_component_props($$renderer, $$props) {
	let { children, item: outer } = $$props;
	{
		function item($$renderer, value) {
			$$renderer.push(`<span>${$.escape(value)}</span>`);
		}
		function children($$renderer, value) {
			children?.($$renderer, value);
		}
		List($$renderer, {
			item,
			children,
			$$slots: {
				item: true,
				default: true
			}
		});
	}
	$$renderer.push(`<!----> `);
	{
		function header($$renderer) {
			$$renderer.push(`<h1>Title</h1>`);
		}
		List($$renderer, {
			header,
			children: ($$renderer) => {
				$$renderer.push(`<p>Body</p>`);
			},
			$$slots: {
				header: true,
				default: true
			}
		});
	}
	$$renderer.push(`<!---->`);
}
