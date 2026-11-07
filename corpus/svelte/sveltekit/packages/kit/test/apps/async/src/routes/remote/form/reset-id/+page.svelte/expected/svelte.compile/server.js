import * as $ from 'svelte/internal/server';
import { reset_id } from './form.remote';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<form${$.attributes({ ...reset_id })}><input${$.attributes({ id: 'reset', ...reset_id.fields.message.as('text') }, void 0, void 0, void 0, 4)}/> <button>submit</button> <button type="reset">reset</button></form> <!--[-->`);

		const each_array = $.ensure_array_like(reset_id.fields.message.issues());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let issue = each_array[$$index];

			$$renderer.push(`<p class="error">${$.escape(issue.message)}</p>`);
		}

		$$renderer.push(`<!--]--> `);

		if (reset_id.result?.message) {
			$$renderer.push(`<!--[0--><div id="result">${$.escape(reset_id.result.message)}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}