import * as $ from 'svelte/internal/server';
import { set_message } from '../[test_name]/form.remote.ts';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<form${$.attributes({ ...set_message })}><input${$.attributes({ ...set_message.fields.message.as('text') }, void 0, void 0, void 0, 4)}/> <input${$.attributes(
			{
				...set_message.fields.test_name.as('hidden', 'throwing-error-page')
			},
			void 0,
			void 0,
			void 0,
			4
		)}/> <button${$.attributes({ ...set_message.fields.action.as('submit', 'normal') })}>set message</button></form>`);
	});
}