import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { check_session } from '$lib/pocketbase/user';
import { set_author_mode } from '$lib/pocketbase/author_mode';
import { self } from '$lib/pocketbase/managers';
import { onMount } from 'svelte';

var root = $.from_html(`<div class="loading svelte-n4hdsg">Loading...</div>`);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	let loading = $.state(true);

	const isLocalhost = () => {
		const host = window.location.hostname;

		return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost');
	};

	const tryDevAuth = async () => {
		try {
			const response = await fetch('/api/primo/dev-auth', { method: 'POST' });

			if (response.ok) {
				const data = await response.json();

				if (data.token && data.record && self.instance) {
					self.instance.authStore.save(data.token, data.record);
					set_author_mode(data.author_mode);

					return true;
				}
			}
		} catch {
			// Dev auth not available
		}

		return false;
	};

	onMount(async () => {
		// Check existing session first
		if (await check_session()) {
			await goto('/admin/site');

			return;
		}

		// Try auto-login on localhost
		if (isLocalhost() && await tryDevAuth()) {
			await goto('/admin/site');

			return;
		}

		$.set(loading, false);
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.append($$anchor, div);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(loading)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}