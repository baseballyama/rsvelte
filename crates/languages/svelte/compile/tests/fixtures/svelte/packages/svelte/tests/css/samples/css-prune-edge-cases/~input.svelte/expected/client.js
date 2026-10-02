import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="foo bar svelte-kocmi3">word match</div> <div class="foobar svelte-kocmi3">substring only</div> <div class="bar-foo baz svelte-kocmi3">hyphen separated</div> <div class="afoo foo-x svelte-kocmi3">prefix substring</div> <main class="svelte-kocmi3"><article class="svelte-kocmi3"><section class="svelte-kocmi3"><div class="svelte-kocmi3"><span class="deep svelte-kocmi3">deep</span></div></section></article></main> <nav class="primary svelte-kocmi3"><a href="/" class="svelte-kocmi3">link</a></nav> <nav class="secondary svelte-kocmi3"><button class="svelte-kocmi3">action</button></nav> <p class="a-b svelte-kocmi3">escaped</p> <header class="svelte-kocmi3"><h1 class="svelte-kocmi3">title</h1></header> <ul class="svelte-kocmi3"><li class="active svelte-kocmi3"><span class="svelte-kocmi3">item</span></li></ul>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(18);
	$.append($$anchor, fragment);
}