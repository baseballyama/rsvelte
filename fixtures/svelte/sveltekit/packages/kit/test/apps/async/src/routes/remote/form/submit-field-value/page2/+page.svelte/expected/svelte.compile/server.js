import * as $ from 'svelte/internal/server';
import { my_form } from '../form.remote.ts';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let captured = null;

		my_form.enhance(async ({ fields, submit }) => {
			// the submit field's value should already reflect the clicked button
			captured = fields.quantity.value();

			await submit();
		});

		$$renderer.push(`<form${$.attributes({ ...my_form })}><input${$.attributes({ id: 'input', ...my_form.fields.quantity.as('number') }, void 0, void 0, void 0, 4)}/> <button id="submit" type="submit">submit</button></form> <p id="captured">${$.escape(captured)}</p> <p id="result">${$.escape(my_form.result)}</p>`);
	});
}