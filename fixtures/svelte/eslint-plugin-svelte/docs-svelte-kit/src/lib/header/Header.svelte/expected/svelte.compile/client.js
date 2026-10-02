import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';
import { isActive } from '../utils.js';
import { page } from '$app/stores';
import logo from './logo.svg';
import { resolve } from '$app/paths';

var root = $.from_html(`<header class="svelte-1g4pdyz"><div class="corner svelte-1g4pdyz"><div class="sidebar-button svelte-1g4pdyz" role="button" tabindex="0"><svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" viewBox="0 0 448 512" class="icon svelte-1g4pdyz"><path fill="currentColor" d="M436 124H12c-6.627 0-12-5.373-12-12V80c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12z" class="svelte-1g4pdyz"></path></svg></div> <a class="home-link svelte-1g4pdyz"><img alt="Logo" class="svelte-1g4pdyz"/></a></div> <nav class="svelte-1g4pdyz"><svg viewBox="0 0 2 3" aria-hidden="true" class="svelte-1g4pdyz"><path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" class="svelte-1g4pdyz"></path></svg> <ul class="svelte-1g4pdyz"><li><a class="svelte-1g4pdyz">Home</a></li> <li><a class="svelte-1g4pdyz">User Guide</a></li> <li><a class="svelte-1g4pdyz">Rules</a></li> <li class="svelte-1g4pdyz"><a href="https://eslint-online-playground.netlify.app/#eslint-plugin-svelte%20with%20typescript" target="_blank" rel="noopener noreferrer" class="svelte-1g4pdyz">Playground</a></li></ul> <div class="nav-title svelte-1g4pdyz"><a class="svelte-1g4pdyz"><img alt="Logo" class="svelte-1g4pdyz"/>eslint-plugin-svelte</a></div> <svg viewBox="0 0 2 3" aria-hidden="true" class="svelte-1g4pdyz"><path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" class="svelte-1g4pdyz"></path></svg></nav> <div class="corner svelte-1g4pdyz"><a href="https://github.com/sveltejs/eslint-plugin-svelte" target="_blank" class="github-link svelte-1g4pdyz" rel="noopener noreferrer" aria-label="GitHub"><svg version="1.1" width="16" height="16" viewBox="0 0 16 16" class="octicon octicon-mark-github svelte-1g4pdyz" aria-hidden="true"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" class="svelte-1g4pdyz"></path></svg></a></div></header>`);

export default function Header($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const dispatch = createEventDispatcher();

	function handleToggleSidebar() {
		dispatch('toggleSidebarOpen');
	}

	var header = root();
	var div = $.child(header);
	var div_1 = $.child(div);
	var a = $.sibling(div_1, 2);
	var img = $.only_child(a);

	$.reset(div);

	var nav = $.sibling(div, 2);
	var ul = $.sibling($.child(nav), 2);
	var li = $.child(ul);
	let classes;
	var a_1 = $.only_child(li);
	var li_1 = $.sibling(li, 2);
	let classes_1;
	var a_2 = $.only_child(li_1);
	var li_2 = $.sibling(li_1, 2);
	let classes_2;
	var a_3 = $.only_child(li_2);

	$.next(2);
	$.reset(ul);

	var div_2 = $.sibling(ul, 2);
	var a_4 = $.child(div_2);
	var img_1 = $.child(a_4);

	$.next();
	$.reset(a_4);
	$.reset(div_2);
	$.next(2);
	$.reset(nav);

	var div_3 = $.sibling(nav, 2);
	var a_5 = $.child(div_3);
	var svg = $.child(a_5);
	var path = $.child(svg);

	$.set_style(path, '', {}, { fill: '#2c3e50' });
	$.reset(svg);
	$.reset(a_5);
	$.reset(div_3);
	$.reset(header);

	$.template_effect(
		($0, $1, $2, $3, $4, $5, $6, $7) => {
			$.set_attribute(a, 'href', $0);
			$.set_attribute(img, 'src', logo);
			classes = $.set_class(li, 1, 'svelte-1g4pdyz', null, classes, { active: $1 });
			$.set_attribute(a_1, 'href', $2);
			classes_1 = $.set_class(li_1, 1, 'svelte-1g4pdyz', null, classes_1, { active: $3 });
			$.set_attribute(a_2, 'href', $4);
			classes_2 = $.set_class(li_2, 1, 'svelte-1g4pdyz', null, classes_2, { active: $5 });
			$.set_attribute(a_3, 'href', $6);
			$.set_attribute(a_4, 'href', $7);
			$.set_attribute(img_1, 'src', logo);
		},
		[
			() => resolve('/'),
			() => isActive('/', $page()),
			() => resolve('/'),
			() => isActive('/user-guide/', $page()),
			() => resolve('/user-guide/'),
			() => isActive('/rules/', $page()),
			() => resolve('/rules/'),
			() => resolve('/')
		]
	);

	$.event('click', div_1, handleToggleSidebar);
	$.event('keydown', div_1, (e) => (e.code === 'Enter' || e.code === 'Space') && handleToggleSidebar());
	$.append($$anchor, header);
	$.pop();
	$$cleanup();
}