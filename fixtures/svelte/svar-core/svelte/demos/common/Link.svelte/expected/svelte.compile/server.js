import * as $ from 'svelte/internal/server';
import { link, location } from "svelte-spa-router";

export default function Link($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data, skin, onclick: click } = $$props;
		const fullPath = $.derived(() => data[0].replace(":skin", skin));
		const isActive = $.derived(() => $.store_get($$store_subs ??= {}, '$location', location).startsWith(fullPath()));

		$$renderer.push(`<a href="/"${$.attr_class('demo svelte-3ib7bl', void 0, { 'active': isActive() })}>${$.escape(data[1])}</a>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}