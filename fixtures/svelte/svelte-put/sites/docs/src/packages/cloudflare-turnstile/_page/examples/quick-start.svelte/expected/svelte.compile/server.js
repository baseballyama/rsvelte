import * as $ from 'svelte/internal/server';
import { turnstile } from '@svelte-put/cloudflare-turnstile';
import { PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY } from '$env/static/public';

export default function Quick_start($$renderer) {
	// assume using SvelteKit and the '$env/static/public' module is available
	let token = '';

	;;
	$$renderer.push(`<div${$.attr('turnstile-sitekey', PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY)} turnstile-theme="auto" turnstile-size="normal" turnstile-language="en" turnstile-response-field-name="turnstile" turnstile-response-field=""></div> <p>Captured Token: <span class="hl-success px-2">${$.escape(token ?? 'pending')}</span></p>`);
}