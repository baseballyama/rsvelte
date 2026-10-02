import * as $ from 'svelte/internal/server';
import foo from './foo.js';

export default function Main($$renderer) {
	var $$store_subs;
	const answer = $.store_get($$store_subs ??= {}, '$foo', foo);

	$$renderer.push(`<p>${$.escape(answer)}</p>`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}