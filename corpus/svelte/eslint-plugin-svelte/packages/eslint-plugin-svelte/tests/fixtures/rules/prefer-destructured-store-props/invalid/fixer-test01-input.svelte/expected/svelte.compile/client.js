import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import store from './store.js';

export default function Fixer_test01_input($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `$foo: ${$store().$foo ?? ''}
bar: ${$store().bar ?? ''}
baz: ${$store().baz ?? ''}
var: ${$store().var ?? ''}
null: ${$store().null ?? ''}
undefined: ${$store().undefined ?? ''}`));

	$.append($$anchor, text);
	$.pop();
	$$cleanup();
}