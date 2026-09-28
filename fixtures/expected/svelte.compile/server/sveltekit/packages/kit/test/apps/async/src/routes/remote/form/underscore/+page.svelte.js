import * as $ from 'svelte/internal/server';
import { register } from './form.remote.ts';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<form${$.attributes({ ...register }, 'svelte-pdr925')}><input${$.attributes({ ...register.fields.username.as('text') }, 'svelte-pdr925', void 0, void 0, 4)}/> <input${$.attributes({ ...register.fields._password.as('password') }, 'svelte-pdr925', void 0, void 0, 4)}/> <button>submit</button></form> <pre>${$.escape(JSON.stringify(register.fields.issues(), null, '  '))}</pre>`);
	});
}