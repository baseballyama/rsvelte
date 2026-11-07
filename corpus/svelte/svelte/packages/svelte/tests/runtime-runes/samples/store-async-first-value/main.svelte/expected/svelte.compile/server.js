import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	var $$store_subs;

	function store() {
		return {
			subscribe: (cb) => {
				setTimeout(
					() => {
						cb(42);
					},
					100
				);

				return () => {};
			}
		};
	}

	const value1 = store();
	const value2 = store();
	const derivedValue = $.derived(() => $.store_get($$store_subs ??= {}, '$value1', value1));

	$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$value2', value2))} / ${$.escape(derivedValue())}`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}