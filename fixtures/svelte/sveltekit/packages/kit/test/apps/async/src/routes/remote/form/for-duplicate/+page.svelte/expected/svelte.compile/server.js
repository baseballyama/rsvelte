import * as $ from 'svelte/internal/server';
import { get_count, increment } from './form.remote.ts';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const count = get_count();

		$$renderer.push(`<p id="count">${$.escape(count.current)}</p> <form${$.attributes({
			...increment.for((count.current || 1) && 'a').enhance(async ({ submit }) => {
				await submit();
			})
		})}><button type="submit" id="submit">Submit</button></form>`);
	});
}