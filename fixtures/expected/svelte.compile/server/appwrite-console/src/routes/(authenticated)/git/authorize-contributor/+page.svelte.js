import * as $ from 'svelte/internal/server';
import { Vcs, Client } from '@appwrite.io/console';
import { onMount } from 'svelte';
import { getApiEndpoint } from '$lib/stores/sdk';
import { Badge, Layout, Typography } from '@appwrite.io/pink-svelte';
import { Button } from '$lib/elements/forms';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data } = $$props;
		const endpoint = getApiEndpoint();
		const client = new Client();
		const vcs = new Vcs(client);
		let error = '';
		let success = '';
		let loading = false;

		onMount(async () => {
			client.setEndpoint(endpoint).setProject(data.projectId).setMode('admin');
		});

		async function approveDeployment() {
			if (loading) {
				return;
			}

			loading = true;
			error = '';
			success = '';

			try {
				await vcs.updateExternalDeployments({
					installationId: data.installationId,
					repositoryId: data.repositoryId,
					providerPullRequestId: data.providerPullRequestId
				});

				success = 'Deployment approved successfully! Build will start soon.';
			} catch(e) {
				error = e.message;
			} finally {
				loading = false;
			}
		}

		if (Layout.Stack) {
			$$renderer.push('<!--[-->');

			Layout.Stack($$renderer, {
				gap: 'l',
				alignItems: 'center',
				style: 'max-width: 500px;',
				children: ($$renderer) => {
					if (success) {
						$$renderer.push('<!--[0-->');
						Badge($$renderer, { type: 'success', variant: 'secondary', content: success });
					} else if (error) {
						$$renderer.push('<!--[1-->');
						Badge($$renderer, { type: 'error', variant: 'secondary', content: error });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (Typography.Title) {
						$$renderer.push('<!--[-->');

						Typography.Title($$renderer, {
							size: 'l',
							align: 'center',
							children: ($$renderer) => {
								$$renderer.push(`<!---->The deployment for pull request #${$.escape(data.providerPullRequestId)}
        is awaiting approval. When authorized, deployments will be started.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					Button($$renderer, {
						secondary: true,
						disabled: loading,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Approve Deployment`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}