import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scale } from 'svelte/transition';
import { storeContextKey } from '$lib/context';
import { getContext } from 'svelte';

var root = $.from_html(`<div><!></div>`);

export default function ViewTransitionEffect($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const store = getContext(storeContextKey);
	var div = root();
	var node = $.child(div);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(div);
	$.transition(1, div, () => scale, () => ({ start: $store().activeViewDirection * 0.5 + 1, delay: 110 }));
	$.transition(2, div, () => scale, () => ({ start: $store().activeViewDirection * -0.5 + 1 }));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}