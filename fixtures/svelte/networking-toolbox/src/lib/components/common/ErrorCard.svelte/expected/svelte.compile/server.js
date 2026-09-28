import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';

export default function ErrorCard($$renderer, $$props) {
	let { title = 'Error', error } = $$props;

	if (error) {
		$$renderer.push(`<!--[0--><div class="card error-card"><div class="card-content"><div class="error-content">`);
		Icon($$renderer, { name: 'alert-triangle', size: 'md' });
		$$renderer.push(`<!----> <div><strong>${$.escape(title)}</strong> <p>${$.escape(error)}</p></div></div></div></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}