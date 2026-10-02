import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const normal = writable(0);
		const modifier = writable(0);
		const lists = writable([]);

		const click = (e, type) => {
			if (type === 'normal') {
				$.update_store($$store_subs ??= {}, '$normal', normal);
			} else {
				$.update_store($$store_subs ??= {}, '$modifier', modifier);
			}
		};

		function getNormalCount() {
			return $.store_get($$store_subs ??= {}, '$normal', normal);
		}

		function getModifierCount() {
			return $.store_get($$store_subs ??= {}, '$modifier', modifier);
		}

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$lists', lists));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<div>${$.escape(item.text)} <button>Normal</button> <button>Modifier</button></div>`);
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { lists, getNormalCount, getModifierCount });
	});
}