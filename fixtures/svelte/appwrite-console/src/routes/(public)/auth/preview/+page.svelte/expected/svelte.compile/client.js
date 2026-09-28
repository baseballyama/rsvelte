import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import { Layout, Spinner, Typography } from '@appwrite.io/pink-svelte';
import { onMount } from 'svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	onMount(async () => {
		const params = new URLSearchParams(window.location.search);
		const projectId = params.get('projectId');
		const origin = params.get('origin');
		const path = params.get('path');

		try {
			const results = await Promise.all(($$props.data.organizations?.teams ?? []).map((org) => sdk.forConsole.organization(org.$id).listProjects({
				queries: [
					Query.equal('$id', projectId),
					Query.limit(1),
					Query.select(['$id', 'region'])
				],
				total: false
			})));

			const project = results.find((r) => r.projects[0])?.projects[0];

			if (!project) {
				await goto(`${base}/auth/preview/access?origin=${origin}&path=${path}&projectId=${projectId}`);

				return;
			}

			await sdk.forProject(project.region ?? 'default', projectId).project.get();

			const jwt = await sdk.forConsole.account.createJWT();

			window.location.href = `${origin}/_appwrite/authorize?jwt=${jwt.jwt}&path=${path}`;
		} catch {
			await goto(`${base}/auth/preview/access?origin=${origin}&path=${path}&projectId=${projectId}`);
		}
	});

	var fragment = $.comment();

	$.head('6zmk4f', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Preview - Appwrite';
		});
	});

	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			alignItems: 'center',
			justifyContent: 'center',
			style: 'max-width: 400px',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
					Layout_Stack_1($$anchor, {
						direction: 'row',
						alignItems: 'center',
						justifyContent: 'center',
						gap: 's',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							Spinner(node_2, { size: 's' });

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Typography.Text, ($$anchor, Typography_Text) => {
								Typography_Text($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Authenticating...');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Typography.Title, ($$anchor, Typography_Title) => {
					Typography_Title($$anchor, {
						size: 'xl',
						align: 'center',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Please wait while we verify your access');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}