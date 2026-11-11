import * as $ from "svelte/internal/server";
export default function Const_beside_snippet($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items } = $$props;
		{
			function prop($$renderer) {
				const foo = items[0];
				$$renderer.push(`<!---->${$.escape(foo)}`);
			}
			Component($$renderer, {
				prop,
				children: ($$renderer) => {
					const foo = items.length;
					$$renderer.push(`<!---->${$.escape(foo)} `);
					{
						function prop($$renderer) {
							$$renderer.push(`<!---->${$.escape(foo)}`);
						}
						Component($$renderer, {
							prop,
							$$slots: { prop: true }
						});
					}
					$$renderer.push(`<!---->`);
				},
				$$slots: {
					prop: true,
					default: true
				}
			});
		}
	});
}
