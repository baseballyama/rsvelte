import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	var $$store_subs;
	const store = someStore();

	$.store_get($$store_subs ??= {}, '$store', store);
	$.store_get($$store_subs ??= {}, '$store', store).prop;
	$.store_get($$store_subs ??= {}, '$store', store)['prop'];
	$.store_get($$store_subs ??= {}, '$store', store).prop.anotherProp;
	$.store_get($$store_subs ??= {}, '$store', store)['prop'].anotherProp;
	$.store_get($$store_subs ??= {}, '$store', store).prop['anotherProp'];
	$.store_get($$store_subs ??= {}, '$store', store)['prop']['anotherProp'];
	$.store_get($$store_subs ??= {}, '$store', store)?.prop.anotherProp;
	$.store_get($$store_subs ??= {}, '$store', store)?.prop?.anotherProp;
	$$renderer.push(`<p>${$.escape($.store_get($$store_subs ??= {}, '$store', store))}</p> <p>${$.escape($.store_get($$store_subs ??= {}, '$store', store).prop)}</p> <p>${$.escape($.store_get($$store_subs ??= {}, '$store', store)['prop'])}</p> <p>${$.escape($.store_get($$store_subs ??= {}, '$store', store).prop.anotherProp)}</p> <p>${$.escape($.store_get($$store_subs ??= {}, '$store', store)['prop'].anotherProp)}</p> <p>${$.escape($.store_get($$store_subs ??= {}, '$store', store).prop['anotherProp'])}</p> <p>${$.escape($.store_get($$store_subs ??= {}, '$store', store)['prop']['anotherProp'])}</p> <p>${$.escape($.store_get($$store_subs ??= {}, '$store', store)?.prop.anotherProp)}</p> <p>${$.escape($.store_get($$store_subs ??= {}, '$store', store)?.prop?.anotherProp)}</p>`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}