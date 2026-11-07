import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import store from './store.js';

export default function Member01_input($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `foo.bar: ${$store().foo.bar ?? ''}
foo.baz: ${$store().foo.baz ?? ''}`));

	$.append($$anchor, text);
	$.pop();
	$$cleanup();
}