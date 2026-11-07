import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

const moduleStore = writable({ a: 'hi' });

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const store = writable({ a: 'hi' });

		function isBoolean(t) {
			return !!t;
		}

		let test;

		if ($.store_get($$store_subs ??= {}, '$store', store)) {
			if (typeof $.store_get($$store_subs ??= {}, '$store', store).a === 'string') {
				test = $.store_get($$store_subs ??= {}, '$store', store).a === 'string' || $.store_get($$store_subs ??= {}, '$store', store).a === true;
			} else {
				if (isBoolean($.store_get($$store_subs ??= {}, '$store', store).a.b)) {
					test = $.store_get($$store_subs ??= {}, '$store', store).a.b;
					test;
				} else {
					test = $.store_get($$store_subs ??= {}, '$store', store).a.b;
				}
			}
		}

		if ($.store_get($$store_subs ??= {}, '$moduleStore', moduleStore)) {
			if (typeof $.store_get($$store_subs ??= {}, '$moduleStore', moduleStore).a === 'string') {
				test = $.store_get($$store_subs ??= {}, '$moduleStore', moduleStore).a === 'string' || $.store_get($$store_subs ??= {}, '$moduleStore', moduleStore).a === true;
			}
		}

		if ($.store_get($$store_subs ??= {}, '$store', store)) {
			$$renderer.push('<!--[0-->');

			if (typeof $.store_get($$store_subs ??= {}, '$store', store).a === 'string') {
				$$renderer.push(`<!--[0-->${$.escape(test = $.store_get($$store_subs ??= {}, '$store', store).a === 'string' || $.store_get($$store_subs ??= {}, '$store', store).a === true)}`);
			} else {
				$$renderer.push('<!--[-1-->');

				if (isBoolean($.store_get($$store_subs ??= {}, '$store', store).a.b)) {
					$$renderer.push(`<!--[0-->${$.escape(test = $.store_get($$store_subs ??= {}, '$store', store).a.b)}`);
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(test = $.store_get($$store_subs ??= {}, '$store', store).a.b)}`);
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if ($.store_get($$store_subs ??= {}, '$moduleStore', moduleStore)) {
			$$renderer.push('<!--[0-->');

			if (typeof $.store_get($$store_subs ??= {}, '$moduleStore', moduleStore).a === 'string') {
				$$renderer.push(`<!--[0-->${$.escape(test = $.store_get($$store_subs ??= {}, '$moduleStore', moduleStore).a === 'string' || $.store_get($$store_subs ??= {}, '$moduleStore', moduleStore).a === true)}`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}