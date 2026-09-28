import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { store } from './store';

var root = $.from_html(`<h1> </h1>`);

export default function Main($$anchor) {
	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var h1 = root();
	var text = $.only_child(h1, true);

	$.template_effect(() => $.set_text(text, $store()));
	$.append($$anchor, h1);
	$$cleanup();
}