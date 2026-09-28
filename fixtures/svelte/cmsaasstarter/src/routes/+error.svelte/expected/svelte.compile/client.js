import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import "../app.css";
import { page } from "$app/stores";

var root = $.from_html(`<div class="hero min-h-[100vh]"><div class="hero-content text-center"><div class="max-w-lg"><h1 class="text-5xl font-bold">This is embarrassing...</h1> <p class="py-6 text-2xl"> </p> <div><a href="/" class="btn btn-primary btn-wide">Return Home</a></div></div></div></div>`);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var p = $.sibling($.child(div_2), 2);
	var text = $.only_child(p);

	$.next(2);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_text(text, `There was an error: ${$page()?.error?.message ?? ''}`));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}