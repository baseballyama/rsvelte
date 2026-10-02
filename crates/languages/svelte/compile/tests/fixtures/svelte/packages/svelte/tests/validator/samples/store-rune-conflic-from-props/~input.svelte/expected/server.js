import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { state } = $$props;
		let x = $.store_get($$store_subs ??= {}, '$state', state)();

		$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$state', state))}`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}