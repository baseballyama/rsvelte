import * as $ from 'svelte/internal/server';
import { redirect_form, reset_form } from './form.remote';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<form${$.attributes({ ...reset_form })}><button${$.attributes({
			id: 'return',
			...reset_form.fields.action.as('submit', 'return')
		})}>Return</button> <button${$.attributes({
			id: 'redirect',
			...reset_form.fields.action.as('submit', 'redirect')
		})}>Redirect</button></form> <div id="result">${$.escape(reset_form.result)}</div> <form${$.attributes({
			...redirect_form.enhance(async ({ submit }) => {
				await submit();
				sessionStorage.setItem('submit-resolved-pathname', location.pathname);
			})
		})}><button id="redirect-other">Redirect to another page</button></form>`);
	});
}