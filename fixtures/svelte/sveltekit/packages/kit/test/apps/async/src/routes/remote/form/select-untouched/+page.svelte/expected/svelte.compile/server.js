import * as $ from 'svelte/internal/server';
import { myform } from './form.remote.ts';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<form${$.attributes({ ...myform })}><input${$.attributes({ ...myform.fields.message.as('text') }, void 0, void 0, void 0, 4)}/> `);

		$$renderer.select({ ...myform.fields.number.as('select') }, ($$renderer) => {
			$$renderer.option({}, ($$renderer) => {
				$$renderer.push(`one`);
			});

			$$renderer.option({}, ($$renderer) => {
				$$renderer.push(`two`);
			});

			$$renderer.option({}, ($$renderer) => {
				$$renderer.push(`three`);
			});
		});

		$$renderer.push(` <button>submit</button></form>`);
	});
}