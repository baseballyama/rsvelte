import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<section class="layout full svelte-1kihmau"><h3>.layout</h3> <div class="l-margin col svelte-1kihmau">Left Margin</div> <div class="main col svelte-1kihmau">Main</div> <div class="sidebar col svelte-1kihmau">Sidebar</div> <div class="r-margin col svelte-1kihmau">Right Margin</div> <div class="l-margin col svelte-1kihmau">Left Margin</div> <div class="content col svelte-1kihmau">Content</div> <div class="r-margin col svelte-1kihmau">Right Margin</div> <div class="full col svelte-1kihmau">Full</div></section> <section class="layout full svelte-1kihmau"><h3>.grid</h3> <section class="grid"><div class="col svelte-1kihmau"></div> <div class="col svelte-1kihmau"></div> <div class="col svelte-1kihmau"></div> <div class="col svelte-1kihmau"></div> <div class="col svelte-1kihmau"></div> <div class="col svelte-1kihmau"></div></section></section>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}