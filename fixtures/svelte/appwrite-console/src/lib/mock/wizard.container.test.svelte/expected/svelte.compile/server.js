import * as $ from 'svelte/internal/server';
import { wizard } from '$lib/stores/wizard';

export default function Wizard_container_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		if ($.store_get($$store_subs ??= {}, '$wizard', wizard).show && $.store_get($$store_subs ??= {}, '$wizard', wizard).component) {
			$$renderer.push('<!--[0-->');

			if ($.store_get($$store_subs ??= {}, '$wizard', wizard).component) {
				$$renderer.push('<!--[-->');
				$.store_get($$store_subs ??= {}, '$wizard', wizard).component($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}