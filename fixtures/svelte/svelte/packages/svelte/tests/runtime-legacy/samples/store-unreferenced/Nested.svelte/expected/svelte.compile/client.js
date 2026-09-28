import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { count } from './store.js';

var root = $.from_html(`<p> </p>`);

export default function Nested($$anchor) {
	const $count = () => $.store_get(count, '$count', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var p = root();
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `count: ${$count() ?? ''}`));
	$.append($$anchor, p);
	$$cleanup();
}