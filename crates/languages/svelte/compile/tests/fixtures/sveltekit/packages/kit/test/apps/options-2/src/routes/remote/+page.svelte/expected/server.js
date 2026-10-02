import * as $ from 'svelte/internal/server';
import { prerendered, get_count, set_count, set_count_form } from './count.remote.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = null;
		let prerendered_result = null;

		$$renderer.push(`<p id="count">${$.escape(count)}</p> <button>get count</button> <button id="reset-btn">reset</button> <form${$.attributes({
			...set_count_form.enhance(async ({ submit }) => {
				await submit();
				count = await get_count();
			})
		})}><input${$.attributes({ ...set_count_form.fields.count.as('text') }, void 0, void 0, void 0, 4)}/> <button>submit</button></form> <button id="fetch-prerendered">get prerendered</button> <p id="prerendered">${$.escape(prerendered_result)}</p>`);
	});
}