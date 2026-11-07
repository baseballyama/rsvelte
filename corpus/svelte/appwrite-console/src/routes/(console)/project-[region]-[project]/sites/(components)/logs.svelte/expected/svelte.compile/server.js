import * as $ from 'svelte/internal/server';
import { capitalize } from '$lib/helpers/string';
import { app } from '$lib/stores/app';
import { getEffectiveBuildStatus } from '$lib/helpers/buildTimeout';
import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
import { Badge, Card, Layout, Logs, Spinner, Typography } from '@appwrite.io/pink-svelte';
import LogsTimer from './logsTimer.svelte';

export function badgeTypeDeployment(status) {
	switch (status) {
		case 'failed':
			return 'error';

		case 'ready':
			return 'success';

		case 'building':

		case 'finalizing':
			return 'warning';

		case 'processing':
			return undefined;

		default:
			return undefined;
	}
}

export default function Logs_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			deployment = void 0,
			hideTitle = false,
			hideScrollButtons = false,
			height = 'auto',
			fullHeight = false,
			emptyCopy = 'No logs available'
		} = $$props;

		let effectiveStatus = $.derived(() => getEffectiveBuildStatus(deployment, $.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)));

		function setCopy() {
			if (effectiveStatus() === 'failed') {
				return 'Your deployment has failed.';
			} else if (effectiveStatus() === 'building') {
				//Do not remove empty space before the string it's an invisible character
				return '[37mPreparing for build ... [0m\n';
			} else if (effectiveStatus() === 'waiting') {
				return '[37mPreparing for build ... [0m\n';
			} else if (effectiveStatus() === 'processing') {
				return '[37mPreparing for build ... [0m\n';
			} else {
				return emptyCopy;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Layout.Stack) {
				$$renderer.push('<!--[-->');

				Layout.Stack($$renderer, {
					gap: 'xl',
					children: ($$renderer) => {
						if (!hideTitle) {
							$$renderer.push('<!--[0-->');

							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									direction: 'row',
									justifyContent: 'space-between',
									children: ($$renderer) => {
										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												direction: 'row',
												alignItems: 'center',
												gap: 's',
												inline: true,
												children: ($$renderer) => {
													if (Typography.Text) {
														$$renderer.push('<!--[-->');

														Typography.Text($$renderer, {
															variant: 'm-500',
															color: '--fgcolor-neutral-primary',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Deployment logs`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													Badge($$renderer, {
														content: capitalize(effectiveStatus()),
														size: 'xs',
														variant: 'secondary',
														type: badgeTypeDeployment(effectiveStatus())
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

										$$renderer.push(` `);
										LogsTimer($$renderer, { deployment });
										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (['waiting', 'processing'].includes(effectiveStatus()) || effectiveStatus() === 'building' && !deployment?.buildLogs?.length) {
							$$renderer.push('<!--[0-->');

							if (Card.Base) {
								$$renderer.push('<!--[-->');

								Card.Base($$renderer, {
									variant: 'secondary',
									children: ($$renderer) => {
										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												direction: 'row',
												justifyContent: 'center',
												gap: 's',
												children: ($$renderer) => {
													Spinner($$renderer, {});
													$$renderer.push(`<!----> Waiting for build to start...`);
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
						} else {
							$$renderer.push(`<!--[-1--><!---->`);

							{
								Logs($$renderer, {
									fullHeight,
									height,
									showScrollButton: !hideScrollButtons,
									logs: deployment.buildLogs || setCopy(),
									get theme() {
										return $.store_get($$store_subs ??= {}, '$app', app).themeInUse;
									},

									set theme($$value) {
										$.store_mutate($$store_subs ??= {}, '$app', app, $.store_get($$store_subs ??= {}, '$app', app).themeInUse = $$value);
										$$settled = false;
									}
								});
							}

							$$renderer.push(`<!---->`);
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { deployment });
	});
}