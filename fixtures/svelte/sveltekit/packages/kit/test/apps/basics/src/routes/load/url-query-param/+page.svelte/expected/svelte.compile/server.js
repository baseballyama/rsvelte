import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<h1>Hello ${$.escape(page.data.currentClientState ?? '')}</h1> <p>${$.escape(page.data.textFromTheServer)}</p> <a href="/load/url-query-param?currentClientState=ABC">ABC</a> <a href="/load/url-query-param?currentClientState=DEF">DEF</a> <hr/> <a href="/load/url-query-param" data-sveltekit-reload="">Reload site</a>`);
	});
}