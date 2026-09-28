import * as $ from 'svelte/internal/server';
import { my_form } from './form.remote.ts';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<form${$.attributes({ ...my_form })}><button${$.attributes({ ...my_form.fields.submitter.as('submit', 'hello') })}>submit</button></form> <p id="result">${$.escape(my_form.result)}</p>`);
	});
}