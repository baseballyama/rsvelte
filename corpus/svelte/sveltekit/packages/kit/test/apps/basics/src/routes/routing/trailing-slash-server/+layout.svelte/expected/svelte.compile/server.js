import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, children } = $$props;

		$$renderer.push(`<ul><li><a href="/routing/trailing-slash-server/always">/always</a></li> <li><a href="/routing/trailing-slash-server/ignore">/ignore</a></li> <li><a href="/routing/trailing-slash-server/ignore/">/ignore/</a></li> <li><a href="/routing/trailing-slash-server/never/">/never/</a></li></ul> <p data-test-id="pathname-store">${$.escape(page.url.pathname)}</p> <p data-test-id="pathname-data">${$.escape(data.pathname)}</p> `);
		children($$renderer);
		$$renderer.push(`<!---->`);
	});
}