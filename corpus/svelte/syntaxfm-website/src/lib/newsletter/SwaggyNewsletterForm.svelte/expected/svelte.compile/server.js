import * as $ from 'svelte/internal/server';
import Input from '$lib/forms/Input.svelte';
import swag from './swag.png';

export default function SwaggyNewsletterForm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let is_hidden = false;
		const FORM_ID = 5465361;
		let action = $.derived(() => `https://app.convertkit.com/forms/${FORM_ID}/subscriptions`);

		function submit() {
			document.cookie = 'newsletter_visible=hidden';
		}

		if (!is_hidden) {
			$$renderer.push(`<!--[0--><div class="newsletter-layout card svelte-zha2zy"><h5 class="h6 svelte-zha2zy">15% off your swag order</h5> <img${$.attr('src', swag)} alt="Syntax Swag Photos" class="svelte-zha2zy"/> <p class="svelte-zha2zy">Subscribe to the Syntax<br/><a href="/snackpack" class="svelte-zha2zy">Snack Pack Newsletter</a></p> <form${$.attr('action', action())} method="post"${$.attr('data-sv-form', FORM_ID)} data-uid="05d939b74d" class="center readable" target="_blank" aria-labelledby="newsletter-form-label"><div class="newsletter svelte-zha2zy">`);

			Input($$renderer, {
				required: true,
				type: 'email',
				label: 'Email',
				id: 'email_address'
			});

			$$renderer.push(`<!----> <button class="black small" type="submit">Subscribe</button></div></form></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}