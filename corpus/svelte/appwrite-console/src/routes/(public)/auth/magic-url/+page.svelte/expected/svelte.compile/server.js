import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { getApiEndpoint } from '$lib/stores/sdk';
import { Account, Client } from '@appwrite.io/console';
import { Typography } from '@appwrite.io/pink-svelte';
import { onMount } from 'svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const client = new Client();
		const account = new Account(client);
		const endpoint = getApiEndpoint();

		onMount(async () => {
			const projectId = page.url.searchParams.get('project');

			client.setEndpoint(endpoint).setProject(projectId);

			const userId = page.url.searchParams.get('userId');
			const secret = page.url.searchParams.get('secret');

			await account.createSession({ userId, secret });
			window.location.href = `appwrite-callback-${projectId}://${page.url.search}`;
		});

		if (Typography.Title) {
			$$renderer.push('<!--[-->');

			Typography.Title($$renderer, {
				size: 'xl',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Missing redirect URL`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` <p>Your Magic URL login flow is missing a proper redirect URL. Please check the <a href="https://appwrite.io/docs/references/cloud/client-web/account#createMagicURLSession">Magic URL docs</a> and send request for new session with a valid redirect URL.</p>`);
	});
}