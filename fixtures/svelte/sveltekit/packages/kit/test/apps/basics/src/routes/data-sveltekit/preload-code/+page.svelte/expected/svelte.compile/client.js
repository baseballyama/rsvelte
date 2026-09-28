import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a id="eager" href="/data-sveltekit/preload-code/target/eager" data-sveltekit-preload-code="eager">eager</a> <div style="height: 200vh"></div> <a id="viewport" href="/data-sveltekit/preload-code/target/viewport" data-sveltekit-preload-code="viewport">viewport</a> <a id="hover" href="/data-sveltekit/preload-code/target/hover" data-sveltekit-preload-code="hover">hover</a> <a id="tap" href="/data-sveltekit/preload-code/target/tap" data-sveltekit-preload-code="tap">tap</a>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(8);
	$.append($$anchor, fragment);
}