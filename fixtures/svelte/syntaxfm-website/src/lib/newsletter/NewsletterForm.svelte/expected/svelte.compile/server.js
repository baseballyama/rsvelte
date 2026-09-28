import * as $ from 'svelte/internal/server';
import NewsletterLogo from './NewsletterLogo.svelte';
import Input from '$lib/forms/Input.svelte';

export default function NewsletterForm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let is_hidden = false;
		let { show_logo = true } = $$props;
		const FORM_ID = 5465361;
		let action = $.derived(() => `https://app.convertkit.com/forms/${FORM_ID}/subscriptions`);

		function submit() {
			document.cookie = 'newsletter_visible=hidden';
		}

		$$renderer.push(`<div class="newsletter-layout svelte-13iisdc">`);

		if (show_logo) {
			$$renderer.push(`<!--[0--><div class="newsletter-logo-container svelte-13iisdc"><a href="/snackpack">`);
			NewsletterLogo($$renderer, {});
			$$renderer.push(`<!----></a></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <form${$.attr('action', action())} method="post"${$.attr('data-sv-form', FORM_ID)} data-uid="05d939b74d" class="center readable svelte-13iisdc" target="_blank" aria-labelledby="newsletter-form-label"><h5 class="readable join fst-400-i svelte-13iisdc">Join our newsletter for <strong class="svelte-13iisdc">15% off</strong> all Syntax &amp; Sentry swag</h5> <div class="newsletter svelte-13iisdc">`);

		Input($$renderer, {
			required: true,
			type: 'email',
			label: 'Email',
			id: 'email_address'
		});

		$$renderer.push(`<!----> <button type="submit" class="svelte-13iisdc">Subscribe</button></div> <p class="svelte-13iisdc">Hot takes, tips &amp; tricks, new content, swag drops &amp; more</p> <p class="text-sm svelte-13iisdc">Dip at any time.</p></form></div>`);
	});
}