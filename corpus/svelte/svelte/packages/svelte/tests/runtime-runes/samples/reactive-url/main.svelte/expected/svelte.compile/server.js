import * as $ from 'svelte/internal/server';
import { SvelteURL } from 'svelte/reactivity';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let url = new SvelteURL('https://svelte.dev/repl/hello-world?version=5.0');

		$$renderer.push(`<div>href: ${$.escape(url.href)}</div> <div>host: ${$.escape(url.host)}</div> <div>pathname: ${$.escape(url.pathname)}</div> <div>search: ${$.escape(url.search)}</div> <div>version: ${$.escape(url.searchParams.get('version'))}</div> <div>t: ${$.escape(url.searchParams.get('t'))}</div> <button>update hostname</button> <button>update pathname</button> <button>update search</button> <button>update href</button>`);
	});
}