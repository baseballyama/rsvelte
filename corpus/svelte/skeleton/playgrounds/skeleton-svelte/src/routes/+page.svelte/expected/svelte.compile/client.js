import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="flex h-full w-full items-center justify-center"><div class="max-w-[600px] text-balance text-center"><p>This is a sandbox for <code class="code">@skeletonlabs/skeleton-svelte</code>. Select a feature from the list to preview.</p></div></div> j`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next();
	$.append($$anchor, fragment);
}