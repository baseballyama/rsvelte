import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { imported, createStore } from './store.js';

var root = $.from_html(`<div></div>`);

export default function Unused_write_only_store_input($$anchor, $$props) {
	$.push($$props, true);

	const $writeOnly = () => $.store_get(writeOnly, '$writeOnly', $$stores);
	const $readOnly = () => $.store_get(readOnly, '$readOnly', $$stores);
	const $imported = () => $.store_get(imported, '$imported', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const writeOnly = createStore();

	$.store_set(writeOnly, 99);

	const readOnly = createStore();

	$readOnly();
	$.store_set(imported, 'some value');

	var div = root();

	$.event('click', div, () => $.store_set(imported, 'clicked'));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}