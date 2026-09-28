import * as $ from 'svelte/internal/server';
import IFrame from '$lib/builder/components/IFrame.svelte';
import { LibrarySymbols } from '$lib/pocketbase/collections';
import { block_html } from '$lib/builder/code_generators';
import { locale } from '$lib/builder/stores/app';
import { useContent } from '$lib/Content.svelte';
import * as _ from 'lodash-es';

export default function SymbolButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		/** @type {Props} */
		let { symbol, onclick, children = null, show_price = false } = $$props;

		const code = $.derived(() => symbol && { html: symbol.html, css: symbol.css, js: symbol.js });
		const _data = $.derived(() => useContent(symbol, { target: 'cms' }));
		const data = $.derived(() => _data() && (_data()[$.store_get($$store_subs ??= {}, '$locale', locale)] ?? {}));
		let last_input;
		let generated_code = void 0;

		// Skip recompilation if data is effectively unchanged
		const showing_footer = $.derived(() => symbol?.name || children || show_price);

		$$renderer.push(`<div class="relative w-full bg-gray-900 rounded-bl rounded-br"><button${$.attr_class('w-full rounded-tl rounded-tr overflow-hidden', void 0, { 'rounded': !showing_footer() })}>`);
		IFrame($$renderer, { componentCode: generated_code });
		$$renderer.push(`<!----></button> `);

		if (showing_footer()) {
			$$renderer.push(`<!--[0--><div class="w-full p-3 pt-2 bg-gray-900 truncate flex items-center justify-between"><div class="flex items-center gap-2" style="width: calc(100% - 2rem)">`);

			if (symbol?.name) {
				$$renderer.push(`<!--[0--><div class="text-xs leading-none truncate">${$.escape(symbol?.name)}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (show_price) {
				$$renderer.push(`<!--[0--><div class="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">Free</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (children) {
				$$renderer.push(`<!--[0--><div>`);
				children($$renderer);
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}