import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { toast } from '$lib/index.js';

var root = $.from_html(`<div class="wrapper svelte-juboms"><div class="toastWrapper svelte-juboms"><div class="toast svelte-juboms"></div> <div class="toast svelte-juboms"></div> <div class="toast svelte-juboms"></div></div> <h1 class="heading svelte-juboms">Svelte Sonner</h1> <p class="hero-description svelte-juboms">An opinionated toast component for Svelte.<br/> A port of Emil Kowalski's
		Sonner.</p> <div class="buttons svelte-juboms"><button data-testid="default-button" data-primary="" class="button svelte-juboms">Render a toast</button> <a class="button svelte-juboms" href="https://github.com/wobsoriano/svelte-sonner" target="_blank">GitHub</a></div></div>`);

export default function Hero($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var div_1 = $.sibling($.child(div), 6);
	var button = $.child(div_1);

	$.next(2);
	$.reset(div_1);
	$.reset(div);

	$.delegated('click', button, () => {
		toast('Sonner', { description: 'An opinionated toast component for Svelte.' });
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);