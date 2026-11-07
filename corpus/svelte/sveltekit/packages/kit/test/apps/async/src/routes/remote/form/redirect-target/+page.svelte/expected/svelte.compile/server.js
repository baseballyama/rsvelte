import * as $ from 'svelte/internal/server';
import { redirectForm } from './form.remote.ts';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<form${$.attributes({
			...redirectForm.for('blank'),
			target: '_blank',
			'data-testid': 'form-blank'
		})}><button type="submit">Submit blank</button></form> <form${$.attributes({ ...redirectForm.for('same'), 'data-testid': 'form-same' })}><button type="submit">Submit same</button></form> <form${$.attributes({
			...redirectForm.for('input'),
			'data-testid': 'form-input-blank'
		})}><input type="submit" formtarget="_blank" value="Submit input blank"/></form>`);
	});
}