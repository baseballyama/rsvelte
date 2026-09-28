import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Vcs, Client } from '@appwrite.io/console';
import { onMount } from 'svelte';
import { getApiEndpoint } from '$lib/stores/sdk';
import { Badge, Layout, Typography } from '@appwrite.io/pink-svelte';
import { Button } from '$lib/elements/forms';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const endpoint = getApiEndpoint();
	const client = new Client();
	const vcs = new Vcs(client);
	let error = $.state('');
	let success = $.state('');
	let loading = $.state(false);

	onMount(async () => {
		client.setEndpoint(endpoint).setProject($$props.data.projectId).setMode('admin');
	});

	async function approveDeployment() {
		if ($.get(loading)) {
			return;
		}

		$.set(loading, true);
		$.set(error, '');
		$.set(success, '');

		try {
			await vcs.updateExternalDeployments({
				installationId: $$props.data.installationId,
				repositoryId: $$props.data.repositoryId,
				providerPullRequestId: $$props.data.providerPullRequestId
			});

			$.set(success, 'Deployment approved successfully! Build will start soon.');
		} catch(e) {
			$.set(error, e.message, true);
		} finally {
			$.set(loading, false);
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			gap: 'l',
			alignItems: 'center',
			style: 'max-width: 500px;',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						Badge($$anchor, {
							type: 'success',
							variant: 'secondary',
							get content() {
								return $.get(success);
							}
						});
					};

					var consequent_1 = ($$anchor) => {
						Badge($$anchor, {
							type: 'error',
							variant: 'secondary',
							get content() {
								return $.get(error);
							}
						});
					};

					$.if(node_1, ($$render) => {
						if ($.get(success)) $$render(consequent); else if ($.get(error)) $$render(consequent_1, 1);
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Typography.Title, ($$anchor, Typography_Title) => {
					Typography_Title($$anchor, {
						size: 'l',
						align: 'center',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, `The deployment for pull request #${$$props.data.providerPullRequestId ?? ''}
        is awaiting approval. When authorized, deployments will be started.`));

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_2, 2);

				Button(node_3, {
					secondary: true,
					get disabled() {
						return $.get(loading);
					},
					$$events: { click: approveDeployment },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Approve Deployment');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}