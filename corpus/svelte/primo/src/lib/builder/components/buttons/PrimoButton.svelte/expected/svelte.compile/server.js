import * as $ from 'svelte/internal/server';
import Icon from '@iconify/svelte';
import { loadingSite } from '../../stores/app/misc';
import UI from '../../ui';

export default function PrimoButton($$renderer) {
	var $$store_subs;

	function get_dashboard_url() {
		if (typeof window === 'undefined') return '/admin/dashboard';

		const { protocol, hostname, port } = window.location;

		if (hostname === 'localhost' || hostname === '127.0.0.1') {
			return `${protocol}//${hostname}${port ? `:${port}` : ''}/`;
		}

		if (hostname.endsWith('.localhost')) {
			return `${protocol}//localhost${port ? `:${port}` : ''}/`;
		}

		return '/admin/dashboard';
	}

	$$renderer.push(`<a class="primo-button svelte-labovz" aria-label="See all sites"${$.attr('href', get_dashboard_url())}>`);

	if ($.store_get($$store_subs ??= {}, '$loadingSite', loadingSite)) {
		$$renderer.push('<!--[0-->');

		if (UI.Spinner) {
			$$renderer.push('<!--[-->');
			UI.Spinner($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	} else {
		$$renderer.push('<!--[-1-->');
		Icon($$renderer, { icon: 'mage:dashboard-fill' });
	}

	$$renderer.push(`<!--]--></a>`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}