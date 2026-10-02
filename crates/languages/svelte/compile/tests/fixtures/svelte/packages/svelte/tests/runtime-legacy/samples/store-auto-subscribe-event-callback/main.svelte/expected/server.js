import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		function createValidator() {
			const { subscribe, set } = writable({ dirty: false, valid: false });

			function action(node, binding) {
				return {
					update(value) {
						set({ dirty: true, valid: value !== '' });
					}
				};
			}

			return [{ subscribe }, action];
		}

		const [validity, validate] = createValidator();
		let email = null;

		$$renderer.push(`<input class="input" type="text"${$.attr('value', email)} placeholder="Type here"/> Dirty: ${$.escape($.store_get($$store_subs ??= {}, '$validity', validity).dirty)}
Valid: ${$.escape($.store_get($$store_subs ??= {}, '$validity', validity).valid)}`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { createValidator });
	});
}