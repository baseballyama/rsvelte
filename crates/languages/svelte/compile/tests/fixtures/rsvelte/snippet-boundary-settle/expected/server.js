import * as $ from "svelte/internal/server";
import Input from "./Input.svelte";
export default function Snippet_boundary_settle($$renderer) {
	let value = "";
	function row($$renderer) {
		$$renderer.push(`<p>${$.escape(value)}</p>`);
	}
	let $$settled = true;
	let $$inner_renderer;
	function $$render_inner($$renderer) {
		Input($$renderer, {
			get value() {
				return value;
			},
			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});
		$$renderer.push(`<!----> `);
		{
			function failed($$renderer) {
				$$renderer.push(`<p>failed</p>`);
			}
			$$renderer.boundary({ failed }, ($$renderer) => {
				$$renderer.push(`<!--[-->`);
				{
					function other($$renderer) {
						$$renderer.push(`<p>other</p>`);
					}
					other($$renderer);
					$$renderer.push(`<!----> `);
					row($$renderer);
					$$renderer.push(`<!---->`);
				}
				$$renderer.push(`<!--]-->`);
			});
		}
	}
	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);
	$$renderer.subsume($$inner_renderer);
}
