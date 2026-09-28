import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import './page.css';
import { page } from '$app/stores';
import { browser, version } from '$app/environment';
import NavMenu from './NavMenu.svelte';

var root = $.from_html(`<style>@import url('https://fonts.googleapis.com/css2?family=Fira+Mono&family=Source+Sans+3:wght@400;600;800&display=swap');</style>`);
var root_1 = $.from_html(`<div class="page svelte-18s1yha"><nav class="svelte-18s1yha"><div class="header svelte-18s1yha"><button aria-label="Toggle menu" class="svelte-18s1yha"><svg viewBox="0 0 24 24" class="svelte-18s1yha"><line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" class="svelte-18s1yha"></line><line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" class="svelte-18s1yha"></line><line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" class="svelte-18s1yha"></line></svg></button> <h1 class="svelte-18s1yha"><a href="/svelte-canvas">svelte-canvas</a> <a target="_blank" href="https://github.com/dnass/svelte-canvas/blob/master/CHANGELOG.md"><span class="svelte-18s1yha"> </span></a></h1> <a class="github svelte-18s1yha" target="_blank" href="https://github.com/dnass/svelte-canvas" aria-label="GitHub"><svg viewBox="0 0 98 96" class="svelte-18s1yha"><path fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="currentColor"></path></svg></a></div> <div><!></div></nav> <main><!></main></div>`);

export default function Layout($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let menuVisible = $.state(false);
	let article = $.derived(() => !$page().url.pathname.includes('/examples/'));

	$.user_effect(() => {
		$page();
		$.set(menuVisible, false);
	});

	$.user_effect(() => {
		if (!browser) return;

		document.body.style.overflow = $.get(menuVisible) ? 'hidden' : 'auto';
	});

	var div = root_1();

	$.head('18s1yha', ($$anchor) => {
		var style = root();

		$.deferred_template_effect(() => {
			$.document.title = `${$$props.title ?? ''} • svelte-canvas`;
		});

		$.append($$anchor, style);
	});

	var nav = $.child(div);
	var div_1 = $.child(nav);
	var button = $.child(div_1);
	var h1 = $.sibling(button, 2);
	var a = $.sibling($.child(h1), 2);
	var span = $.child(a);
	var text = $.only_child(span, true);

	$.reset(a);
	$.reset(h1);
	$.next(2);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	let classes;
	var node = $.child(div_2);

	NavMenu(node, {
		get items() {
			return $$props.data.menu;
		}
	});

	$.reset(div_2);
	$.reset(nav);

	var main = $.sibling(nav, 2);
	let classes_1;
	var node_1 = $.child(main);

	$.snippet(node_1, () => $$props.children);
	$.reset(main);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(button, 'aria-expanded', $.get(menuVisible));
		$.set_text(text, version);
		classes = $.set_class(div_2, 1, 'menu svelte-18s1yha', null, classes, { visible: $.get(menuVisible) });
		classes_1 = $.set_class(main, 1, 'svelte-18s1yha', null, classes_1, { article: $.get(article) });
	});

	$.delegated('click', button, () => $.set(menuVisible, !$.get(menuVisible)));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);