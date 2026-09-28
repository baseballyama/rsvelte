import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let centerRow = { nested: { optional: 2, required: 3 } };
		let someChange = false;

		if (centerRow?.nested) {
			$$renderer.push('<!--[0-->');

			if (centerRow?.nested?.optional != undefined && centerRow.nested.optional > 0) {
				$$renderer.push(`<!--[0-->op: ${$.escape(centerRow.nested.optional)}<br/>`);
			} else {
				$$renderer.push(`<!--[-1-->req: ${$.escape(centerRow.nested.required)}<br/>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <button>Trigger</button>`);
	});
}