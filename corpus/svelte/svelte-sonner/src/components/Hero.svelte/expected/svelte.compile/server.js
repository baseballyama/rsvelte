import * as $ from 'svelte/internal/server';
import { toast } from '$lib/index.js';

export default function Hero($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="wrapper svelte-juboms"><div class="toastWrapper svelte-juboms"><div class="toast svelte-juboms"></div> <div class="toast svelte-juboms"></div> <div class="toast svelte-juboms"></div></div> <h1 class="heading svelte-juboms">Svelte Sonner</h1> <p class="hero-description svelte-juboms">An opinionated toast component for Svelte.<br/> A port of Emil Kowalski's
		Sonner.</p> <div class="buttons svelte-juboms"><button data-testid="default-button" data-primary="" class="button svelte-juboms">Render a toast</button> <a class="button svelte-juboms" href="https://github.com/wobsoriano/svelte-sonner" target="_blank">GitHub</a></div></div>`);
	});
}