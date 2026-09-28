import * as $ from 'svelte/internal/server';
import { submit } from './form.remote.ts';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<form${$.attributes({ ...submit })}><button id="requested-submit">Submit</button></form> <p id="form-result">${$.escape(submit.result?.message ?? 'not submitted')}</p>`);
	});
}