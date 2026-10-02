import * as $ from 'svelte/internal/server';
import { touched_form } from './touched.remote.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<p id="touched-name">Name touched: ${$.escape(touched_form.fields.name.touched())}</p> <p id="touched-age">Age touched: ${$.escape(touched_form.fields.age.touched())}</p> <button id="set-btn" type="button">set name programmatically</button> <form${$.attributes({ ...touched_form })}><label>Name <input${$.attributes({ id: 'name-input', ...touched_form.fields.name.as('text') }, void 0, void 0, void 0, 4)}/></label> <label>Age <input${$.attributes({ id: 'age-input', ...touched_form.fields.age.as('number') }, void 0, void 0, void 0, 4)}/></label> <button id="reset-btn" type="reset">Reset</button></form>`);
	});
}