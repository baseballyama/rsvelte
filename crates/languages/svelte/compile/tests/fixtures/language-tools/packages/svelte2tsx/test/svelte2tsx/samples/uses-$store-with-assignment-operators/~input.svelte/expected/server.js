import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const count = writable(0);
		let myvar = 42; // to show that this is different from ++ or --
		const handler1 = () => $.store_set(count, $.store_get($$store_subs ??= {}, '$count', count) + myvar);
		const handler2 = () => $.store_set(count, $.store_get($$store_subs ??= {}, '$count', count) - myvar);
		const handler3 = () => $.store_set(count, $.store_get($$store_subs ??= {}, '$count', count) * myvar);
		const handler4 = () => $.store_set(count, $.store_get($$store_subs ??= {}, '$count', count) / myvar);
		const handler5 = () => $.store_set(count, $.store_get($$store_subs ??= {}, '$count', count) ** myvar);
		const handler6 = () => $.store_set(count, $.store_get($$store_subs ??= {}, '$count', count) % myvar);
		const handler7 = () => $.store_set(count, $.store_get($$store_subs ??= {}, '$count', count) << myvar);
		const handler8 = () => $.store_set(count, $.store_get($$store_subs ??= {}, '$count', count) >> myvar);
		const handler9 = () => $.store_set(count, $.store_get($$store_subs ??= {}, '$count', count) >>> myvar);
		const handler10 = () => $.store_set(count, $.store_get($$store_subs ??= {}, '$count', count) & myvar);
		const handler11 = () => $.store_set(count, $.store_get($$store_subs ??= {}, '$count', count) ^ myvar);
		const handler12 = () => $.store_set(count, $.store_get($$store_subs ??= {}, '$count', count) | myvar);

		$$renderer.push(`<button>add</button> <button>subtract</button> <button>multiply</button> <button>divide</button> <button>exponent</button> <button>mod</button> <button>leftshift</button> <button>rightshift</button> <button>unsigned rightshift</button> <button>AND</button> <button>XOR</button> <button>OR</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}