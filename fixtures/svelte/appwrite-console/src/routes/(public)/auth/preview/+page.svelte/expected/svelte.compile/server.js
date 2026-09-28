import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import { Layout, Spinner, Typography } from '@appwrite.io/pink-svelte';
import { onMount } from 'svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		onMount(async () => {
			const params = new URLSearchParams(window.location.search);
			const projectId = params.get('projectId');
			const origin = params.get('origin');
			const path = params.get('path');

			try {
				const results = await Promise.all((data.organizations?.teams ?? []).map((org) => sdk.forConsole.organization(org.$id).listProjects({
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

		$.head('6zmk4f', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Preview - Appwrite</title>`);
			});
		});

		if (Layout.Stack) {
			$$renderer.push('<!--[-->');

			Layout.Stack($$renderer, {
				alignItems: 'center',
				justifyContent: 'center',
				style: 'max-width: 400px',
				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							direction: 'row',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 's',
							children: ($$renderer) => {
								Spinner($$renderer, { size: 's' });
								$$renderer.push(`<!----> `);

								if (Typography.Text) {
									$$renderer.push('<!--[-->');

									Typography.Text($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Authenticating...`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Typography.Title) {
						$$renderer.push('<!--[-->');

						Typography.Title($$renderer, {
							size: 'xl',
							align: 'center',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Please wait while we verify your access`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
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