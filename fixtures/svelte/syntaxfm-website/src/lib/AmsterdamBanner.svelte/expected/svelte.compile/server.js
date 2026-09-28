import * as $ from 'svelte/internal/server';
import syntaxLogo from '../assets/syntax-wordmark-wide.svg';

export default function AmsterdamBanner($$renderer) {
	$$renderer.push(`<a href="https://syntax.fm/meetup" target="_blank" class="layout amsterdam-banner svelte-1e0wbax"><div class="banner-content svelte-1e0wbax"><div class="text-section svelte-1e0wbax"><p class="top-line svelte-1e0wbax"><img${$.attr('src', syntaxLogo)} alt="Syntax" class="syntax-logo svelte-1e0wbax"/> <img src="/js-nation-logo.png" alt="JS Nation" class="js-logo svelte-1e0wbax"/></p> <h2 class="title svelte-1e0wbax">AMSTERDAM MEETUP</h2> <p class="date svelte-1e0wbax">JUNE 10TH  6-9PM</p></div></div></a>`);
}