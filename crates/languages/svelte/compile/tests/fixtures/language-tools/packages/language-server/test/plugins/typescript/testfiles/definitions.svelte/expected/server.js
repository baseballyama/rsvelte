import * as $ from 'svelte/internal/server';
import { blubb } from './definitions';
import ImportedFile from './imported-file.svelte';

export default function Definitions($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		function bla() {
			return true;
		}

		bla();
		blubb();

		let store = null;

		$.store_get($$store_subs ??= {}, '$store', store);

		if ($.store_get($$store_subs ??= {}, '$store', store)) {}

		$.store_get($$store_subs ??= {}, '$blubb', blubb);

		if ($.store_get($$store_subs ??= {}, '$blubb', blubb)) {}

		ImportedFile($$renderer, {});
		$$renderer.push(`<!----> ${$.escape($.store_get($$store_subs ??= {}, '$store', store))} `);

		if ($.store_get($$store_subs ??= {}, '$store', store)) {
			$$renderer.push('<!--[0-->');
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> ${$.escape($.store_get($$store_subs ??= {}, '$blubb', blubb))} `);

		if ($.store_get($$store_subs ??= {}, '$blubb', blubb)) {
			$$renderer.push('<!--[0-->');
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}