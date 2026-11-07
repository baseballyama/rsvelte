import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from 'svelte';
import { isActive } from '../utils.js';
import { page } from '$app/stores';
import logo from './logo.svg';
import { resolve } from '$app/paths';

export default function Header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const dispatch = createEventDispatcher();

		function handleToggleSidebar() {
			dispatch('toggleSidebarOpen');
		}

		$$renderer.push(`<header class="svelte-1g4pdyz"><div class="corner svelte-1g4pdyz"><div class="sidebar-button svelte-1g4pdyz" role="button" tabindex="0"><svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" viewBox="0 0 448 512" class="icon svelte-1g4pdyz"><path fill="currentColor" d="M436 124H12c-6.627 0-12-5.373-12-12V80c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12z" class="svelte-1g4pdyz"></path></svg></div> <a${$.attr('href', resolve('/'))} class="home-link svelte-1g4pdyz"><img${$.attr('src', logo)} alt="Logo" class="svelte-1g4pdyz"/></a></div> <nav class="svelte-1g4pdyz"><svg viewBox="0 0 2 3" aria-hidden="true" class="svelte-1g4pdyz"><path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" class="svelte-1g4pdyz"></path></svg> <ul class="svelte-1g4pdyz"><li${$.attr_class('svelte-1g4pdyz', void 0, {
			'active': isActive('/', $.store_get($$store_subs ??= {}, '$page', page))
		})}><a${$.attr('href', resolve('/'))} class="svelte-1g4pdyz">Home</a></li> <li${$.attr_class('svelte-1g4pdyz', void 0, {
			'active': isActive('/user-guide/', $.store_get($$store_subs ??= {}, '$page', page))
		})}><a${$.attr('href', resolve('/user-guide/'))} class="svelte-1g4pdyz">User Guide</a></li> <li${$.attr_class('svelte-1g4pdyz', void 0, {
			'active': isActive('/rules/', $.store_get($$store_subs ??= {}, '$page', page))
		})}><a${$.attr('href', resolve('/rules/'))} class="svelte-1g4pdyz">Rules</a></li> <li class="svelte-1g4pdyz"><a href="https://eslint-online-playground.netlify.app/#eslint-plugin-svelte%20with%20typescript" target="_blank" rel="noopener noreferrer" class="svelte-1g4pdyz">Playground</a></li></ul> <div class="nav-title svelte-1g4pdyz"><a${$.attr('href', resolve('/'))} class="svelte-1g4pdyz"><img${$.attr('src', logo)} alt="Logo" class="svelte-1g4pdyz"/>eslint-plugin-svelte</a></div> <svg viewBox="0 0 2 3" aria-hidden="true" class="svelte-1g4pdyz"><path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" class="svelte-1g4pdyz"></path></svg></nav> <div class="corner svelte-1g4pdyz"><a href="https://github.com/sveltejs/eslint-plugin-svelte" target="_blank" class="github-link svelte-1g4pdyz" rel="noopener noreferrer" aria-label="GitHub"><svg version="1.1" width="16" height="16" viewBox="0 0 16 16" class="octicon octicon-mark-github svelte-1g4pdyz" aria-hidden="true"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" class="svelte-1g4pdyz"${$.attr_style('', { fill: '#2c3e50' })}></path></svg></a></div></header>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}