import * as $ from 'svelte/internal/server';
import { format } from 'date-fns';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let embed = null;

		$$renderer.push(`<main><header class="center svelte-1l9dban"><h2 class="h6">${$.escape(data.subject)}</h2> <p class="text-sm">You are viewing the Newsletter Archive. Published ${$.escape(format(new Date(data.published_at), 'EEEE MMM dd, yyyy'))} <br/> <a href="/snackpack">← Back to all issues</a></p></header> <div class="newsletter-output svelte-1l9dban"><div></div></div></main>`);
	});
}