import * as $ from 'svelte/internal/server';
import { writable, derived } from "svelte/store";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const obj = writable({ a: 1 });
		let count = 0;
		let watcherA = void 0;

		function watch(prop) {
			return derived(obj, (o) => {
				count++;

				return o[prop];
			});
		}

		$$renderer.push(`<input type="number"${$.attr('value', $.store_get($$store_subs ??= {}, '$obj', obj).a)}/> <p>${$.escape(count)}</p> `);

		if (watcherA) {
			$$renderer.push(`<!--[0-->${$.escape($.store_get($$store_subs ??= {}, '$watcherA', watcherA))} <button>remove watcher</button>`);
		} else {
			$$renderer.push(`<!--[-1--><button>add watcher</button>`);
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}