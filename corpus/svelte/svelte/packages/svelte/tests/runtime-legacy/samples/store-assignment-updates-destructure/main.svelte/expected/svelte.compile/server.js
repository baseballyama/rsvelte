import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let userName1 = writable('init1');
		let userName2 = writable('init2');
		let userName3 = writable('init3');
		let userName4 = writable('init4');
		let userName5 = writable('init5');
		let userName6 = writable('init6');
		let userName7 = writable('init7');

		let obj = {
			userName1: 'user1',
			userName2: 'user2',
			userName3: 'user3',
			$userName4: 'user4',
			userName5: 'user5',
			$userName6: 'user6',
			userName7: 'user7'
		};

		(
			$.store_set(userName1, obj.userName1),
			$.store_set(userName2, obj.$userName2)
		);

		($.store_set(userName3, obj.$userName3));
		($.store_set(userName4, obj.$userName4));

		(
			$.store_set(userName5, obj.$userName5),
			$.store_set(userName6, obj.$userName6),
			$.store_set(userName7, obj.$userName7)
		);

		$$renderer.push(`<div>$userName1: ${$.escape($.store_get($$store_subs ??= {}, '$userName1', userName1))}</div> <div>$userName2: ${$.escape($.store_get($$store_subs ??= {}, '$userName2', userName2))}</div> <div>$userName3: ${$.escape($.store_get($$store_subs ??= {}, '$userName3', userName3))}</div> <div>$userName4: ${$.escape($.store_get($$store_subs ??= {}, '$userName4', userName4))}</div> <div>$userName5: ${$.escape($.store_get($$store_subs ??= {}, '$userName5', userName5))}</div> <div>$userName6: ${$.escape($.store_get($$store_subs ??= {}, '$userName6', userName6))}</div> <div>$userName7: ${$.escape($.store_get($$store_subs ??= {}, '$userName7', userName7))}</div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}