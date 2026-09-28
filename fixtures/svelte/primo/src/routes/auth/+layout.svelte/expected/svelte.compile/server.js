import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { check_session } from '$lib/pocketbase/user';
import { set_author_mode } from '$lib/pocketbase/author_mode';
import { self } from '$lib/pocketbase/managers';
import { onMount } from 'svelte';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let loading = true;

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

			loading = false;
		});

		let { children } = $$props;

		if (loading) {
			$$renderer.push(`<!--[0--><div class="loading svelte-n4hdsg">Loading...</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!--]-->`);
	});
}