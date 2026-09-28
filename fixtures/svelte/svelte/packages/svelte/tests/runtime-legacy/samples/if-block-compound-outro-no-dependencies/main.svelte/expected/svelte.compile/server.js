import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const foo = writable(true);

		if ($.store_get($$store_subs ??= {}, '$foo', foo)) {
			$$renderer.push(`<!--[0-->blah`);
		} else {
			$$renderer.push('<!--[-1-->');

			if (bar()) {
				$$renderer.push('<!--[0-->');
				Bar($$renderer, {});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--> `);

		if ($.store_get($$store_subs ??= {}, '$foo', foo)) {
			$$renderer.push(`<!--[0-->blah`);
		} else {
			$$renderer.push('<!--[-1-->');

			if (bar) {
				$$renderer.push('<!--[0-->');
				Baz($$renderer, {});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--> `);

		if ($.store_get($$store_subs ??= {}, '$foo', foo)) {
			$$renderer.push(`<!--[0-->blah`);
		} else if (bar()) {
			$$renderer.push('<!--[1-->');
			Bar($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if ($.store_get($$store_subs ??= {}, '$foo', foo)) {
			$$renderer.push(`<!--[0-->blah`);
		} else if (bar) {
			$$renderer.push('<!--[1-->');
			Bar($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}