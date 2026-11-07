import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';
import { Envelope } from '$lib/icons';

export default function Newsletter($$renderer) {
	let email = '';
	let error = '';
	let success = '';

	async function onsubmit(e) {
		e.preventDefault();

		const response = await fetch('/api/subscribe', {
			method: 'post',
			body: JSON.stringify(email),
			headers: { 'Content-Type': 'application/json' }
		});

		const subscribe = await response.json();

		if (subscribe.error) {
			success = '';
			error = subscribe.error;
		}

		if (subscribe.success) {
			error = '';
			success = subscribe.success;
		}
	}

	$$renderer.push(`<form class="svelte-1w81ggn"><label for="email" class="sr-only">Enter your email</label> <input${$.attr('value', email)} type="email" id="email" name="email" placeholder="your@email.com" autocomplete="on" class="svelte-1w81ggn"/> <button type="submit" class="svelte-1w81ggn">`);
	Envelope($$renderer, { width: 24, height: 24, 'aria-hidden': true });
	$$renderer.push(`<!----> <span class="svelte-1w81ggn">Subscribe</span></button></form> <div class="message svelte-1w81ggn">`);

	if (error) {
		$$renderer.push(`<!--[0--><span class="error svelte-1w81ggn">${$.escape(error)}</span>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (success) {
		$$renderer.push(`<!--[0--><span class="success svelte-1w81ggn">${$.escape(success)}</span>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div>`);
}