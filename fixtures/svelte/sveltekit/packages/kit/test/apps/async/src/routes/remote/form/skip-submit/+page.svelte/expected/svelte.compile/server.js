import * as $ from 'svelte/internal/server';
import { set_message } from './form.remote.ts';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let should_submit = false;
		const pendings_arr = [];

		const pendings = $.derived(() => {
			pendings_arr.push(set_message.pending);

			return pendings_arr.join(', ');
		});

		$$renderer.push(`<label><input type="checkbox"${$.attr('checked', should_submit, true)} data-should-submit=""/> should submit</label> <form${$.attributes({
			...set_message.enhance(async ({ submit }) => {
				if (!should_submit) return;

				await submit();
			})
		})}><button>submit</button></form> <p data-pending="">${$.escape(pendings())}</p>`);
	});
}