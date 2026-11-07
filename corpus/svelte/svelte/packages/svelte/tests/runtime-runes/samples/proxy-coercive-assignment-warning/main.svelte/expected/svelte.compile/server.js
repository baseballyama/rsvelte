import * as $ from 'svelte/internal/server';
import Test from './Test.svelte';

function funBind($$renderer, context) {
	$$renderer.push(`<input/>`);
}

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { opacity = 0.5 } = $$props;
		let entries = [];
		let object = { items: null, group: [] };
		let elementFunBind = void 0;

		// should omit $.assign via static analysis
		const fixed = (node) => node.style.opacity = 0.5;

		// should use $.assign, but it should not warn
		const unknown = (node) => node.style.opacity = opacity;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<button>items: ${$.escape(JSON.stringify(object.items))}</button> <div>x</div> <input type="checkbox" value="1"${$.attr('checked', object.group.includes('1'), true)}/> <input type="checkbox" value="2"${$.attr('checked', object.group.includes('2'), true)}/> `);
			Test($$renderer, {});
			$$renderer.push(`<!----> `);
			Test($$renderer, {});
			$$renderer.push(`<!----> `);

			Test($$renderer, {
				get x() {
					return entries[3];
				},

				set x($$value) {
					entries[3] = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			funBind($$renderer, {
				set element(e) {
					elementFunBind = e;
				}
			});

			$$renderer.push(`<!----> <button>change opacity (fixed)</button> <button>change opacity (unknown)</button>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}