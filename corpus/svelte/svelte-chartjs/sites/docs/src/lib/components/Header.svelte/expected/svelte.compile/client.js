import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import ThemeToggle from './ThemeToggle.svelte';

var root = $.from_html(`<header class="svelte-u9ccss"><div class="left svelte-u9ccss"><button class="menu-btn svelte-u9ccss" aria-label="Toggle menu"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg></button> <a class="logo svelte-u9ccss"><img alt="svelte-chartjs" width="28" height="28"/> <span>svelte-chartjs</span></a></div> <nav class="svelte-u9ccss"><a href="https://github.com/SauravKanchan/svelte-chartjs" target="_blank" rel="noopener noreferrer" aria-label="GitHub" class="svelte-u9ccss"><svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg> <span class="link-label svelte-u9ccss">GitHub</span></a> <a href="https://www.npmjs.com/package/svelte-chartjs" target="_blank" rel="noopener noreferrer" aria-label="npm" class="svelte-u9ccss"><svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor"><path d="M0 0v16h16V0H0zm13.2 13.2H9.6V4.4H6.4v8.8H2.8V2.8h10.4v10.4z"></path></svg> <span class="link-label svelte-u9ccss">npm</span></a> <!></nav></header>`);

export default function Header($$anchor, $$props) {
	let onToggleSidebar = $.prop($$props, 'onToggleSidebar', 3, () => {});
	var header = root();
	var div = $.child(header);
	var button = $.child(div);
	var a = $.sibling(button, 2);
	var img = $.child(a);

	$.next(2);
	$.reset(a);
	$.reset(div);

	var nav = $.sibling(div, 2);
	var node = $.sibling($.child(nav), 4);

	ThemeToggle(node, {});
	$.reset(nav);
	$.reset(header);

	$.template_effect(() => {
		$.set_attribute(a, 'href', `${base}/`);
		$.set_attribute(img, 'src', `${base}/favicon.png`);
	});

	$.delegated('click', button, function (...$$args) {
		onToggleSidebar()?.apply(this, $$args);
	});

	$.append($$anchor, header);
}

$.delegate(['click']);