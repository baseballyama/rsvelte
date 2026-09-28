import * as $ from 'svelte/internal/server';
import { set_message } from '../[test_name]/form.remote.js';
import * as v from 'valibot';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const schema = v.object({
			test_name: v.string(),
			message: v.picklist(
				[
					'hello',
					'goodbye',
					'unexpected error',
					'expected error',
					'redirect'
				],
				'message is invalid'
			)
		});

		$$renderer.push(`<form${$.attributes({ ...set_message.preflight(schema) })}><label><span>Message</span> <input${$.attributes({ ...set_message.fields.message.as('text') }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ ...set_message.fields.test_name.as('hidden', 'imperative') }, void 0, void 0, void 0, 4)}/></label> <p id="issue">${$.escape(set_message.fields.message.issues()?.[0]?.message ?? 'ok')}</p> <p id="value">${$.escape(set_message.fields.message.value())}</p> <button id="set-and-validate" type="button">Set &amp; validate</button> <button>Submit</button></form>`);
	});
}