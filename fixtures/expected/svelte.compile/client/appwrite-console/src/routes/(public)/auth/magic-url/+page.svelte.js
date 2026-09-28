import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { getApiEndpoint } from '$lib/stores/sdk';
import { Account, Client } from '@appwrite.io/console';
import { Typography } from '@appwrite.io/pink-svelte';
import { onMount } from 'svelte';

var root = $.from_html(`<!> <p>Your Magic URL login flow is missing a proper redirect URL. Please check the <a href="https://appwrite.io/docs/references/cloud/client-web/account#createMagicURLSession">Magic URL docs</a> and send request for new session with a valid redirect URL.</p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

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

	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => Typography.Title, ($$anchor, Typography_Title) => {
		Typography_Title($$anchor, {
			size: 'xl',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('Missing redirect URL');

				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	});

	$.next(2);
	$.append($$anchor, fragment);
	$.pop();
}