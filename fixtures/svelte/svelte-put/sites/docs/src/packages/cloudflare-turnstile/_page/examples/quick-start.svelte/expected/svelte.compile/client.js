import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { turnstile } from '@svelte-put/cloudflare-turnstile';
import { PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY } from '$env/static/public';

var root = $.from_html(`<div turnstile-theme="auto" turnstile-size="normal" turnstile-language="en" turnstile-response-field-name="turnstile" turnstile-response-field=""></div> <p>Captured Token: <span class="hl-success px-2"> </span></p>`, 1);

export default function Quick_start($$anchor) {
	// assume using SvelteKit and the '$env/static/public' module is available
	let token = $.state('');

	;;

	var fragment = root();
	var div = $.first_child(fragment);

	$.action(div, ($$node) => turnstile?.($$node));

	var p = $.sibling(div, 2);
	var span = $.sibling($.child(p));
	var text = $.only_child(span, true);

	$.reset(p);

	$.template_effect(() => {
		$.set_attribute(div, 'turnstile-sitekey', PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY);
		$.set_text(text, $.get(token) ?? 'pending');
	});

	$.event('turnstile', div, (e) => $.set(token, e.detail.token, true));
	$.append($$anchor, fragment);
}