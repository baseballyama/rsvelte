import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '@iconify/svelte';
import { loadingSite } from '../../stores/app/misc';
import UI from '../../ui';

var root = $.from_html(`<a class="primo-button svelte-labovz" aria-label="See all sites"><!></a>`);

export default function PrimoButton($$anchor) {
	const $loadingSite = () => $.store_get(loadingSite, '$loadingSite', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

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

	var a = root();
	var node = $.child(a);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => UI.Spinner, ($$anchor, UI_Spinner) => {
				UI_Spinner($$anchor, {});
			});

			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			Icon($$anchor, { icon: 'mage:dashboard-fill' });
		};

		$.if(node, ($$render) => {
			if ($loadingSite()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(a);
	$.template_effect(($0) => $.set_attribute(a, 'href', $0), [() => get_dashboard_url()]);
	$.append($$anchor, a);
	$$cleanup();
}