import * as $ from 'svelte/internal/server';
import { my_form } from './form.remote.ts';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let captured = null;

		my_form.enhance(async ({ fields, submit }) => {
			// the submit field's value should already reflect the clicked button
			captured = fields.quantity.value();

			await submit();
		});

		$$renderer.push(`<a href="/remote/form/submit-field-value/page2">Page 2</a> <form${$.attributes({ ...my_form })}><button${$.attributes({ id: 'one', ...my_form.fields.quantity.as('submit', 1) })}>1</button> <button${$.attributes({ id: 'five', ...my_form.fields.quantity.as('submit', 5) })}>5</button> <button id="no-value" type="submit">no value</button></form> <p id="captured">${$.escape(captured)}</p> <p id="result">${$.escape(my_form.result)}</p>`);
	});
}