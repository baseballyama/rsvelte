import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Welcome to a test project</h1> <a id="scroll-anchor" href="#last-anchor-2" class="svelte-17setk9">Bottom of this page</a> <a id="non-ascii-anchor" href="/anchor/anchor#go-to-encöded" class="svelte-17setk9">Anchor demo (non-ASCII)</a> <a id="special-char-anchor" href="/anchor/anchor#go-to-.=" class="svelte-17setk9">Anchor demo (special characters)</a> <a id="first-anchor" href="/anchor/anchor#go-to-element" class="svelte-17setk9">Anchor demo (first)</a> <div class="svelte-17setk9">Spacing</div> <a id="second-anchor" href="/anchor/anchor#go-to-element" class="svelte-17setk9">Anchor demo (second)</a> <div class="svelte-17setk9">Spacing</div> <a id="third-anchor" href="/anchor/anchor" class="svelte-17setk9">Anchor demo (third)</a> <div class="svelte-17setk9">Spacing</div> <a id="last-anchor" href="/anchor/anchor#go-to-element" class="svelte-17setk9">Anchor demo (last)</a> <a id="last-anchor-2" href="/anchor/anchor" class="svelte-17setk9">Anchor demo (last 2)</a> <a id="routing-page" href="/routing/hashes/target" class="svelte-17setk9">Different page</a> <a id="to-scroll-margin" href="/anchor/anchor#scroll-margin" class="svelte-17setk9">Scroll margin anchor</a>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(26);
	$.append($$anchor, fragment);
}