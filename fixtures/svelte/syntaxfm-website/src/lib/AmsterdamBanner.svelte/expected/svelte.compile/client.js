import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import syntaxLogo from '../assets/syntax-wordmark-wide.svg';

var root = $.from_html(`<a href="https://syntax.fm/meetup" target="_blank" class="layout amsterdam-banner svelte-1e0wbax"><div class="banner-content svelte-1e0wbax"><div class="text-section svelte-1e0wbax"><p class="top-line svelte-1e0wbax"><img alt="Syntax" class="syntax-logo svelte-1e0wbax"/> <img src="/js-nation-logo.png" alt="JS Nation" class="js-logo svelte-1e0wbax"/></p> <h2 class="title svelte-1e0wbax">AMSTERDAM MEETUP</h2> <p class="date svelte-1e0wbax">JUNE 10TH &nbsp;6-9PM</p></div></div></a>`);

export default function AmsterdamBanner($$anchor) {
	var a = root();
	var div = $.child(a);
	var div_1 = $.child(div);
	var p = $.child(div_1);
	var img = $.child(p);

	$.next(2);
	$.reset(p);
	$.next(4);
	$.reset(div_1);
	$.reset(div);
	$.reset(a);
	$.template_effect(() => $.set_attribute(img, 'src', syntaxLogo));
	$.append($$anchor, a);
}