import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { test, store } = $$props;
		let der = $.derived(() => test);
		let state = test;

		$$renderer.push(`<button></button> <button></button> <button></button> <button></button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}