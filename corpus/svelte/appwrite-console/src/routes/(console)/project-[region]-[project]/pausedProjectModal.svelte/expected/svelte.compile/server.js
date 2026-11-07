import * as $ from 'svelte/internal/server';
import { Button } from '$lib/elements/forms';
import { sdk } from '$lib/stores/sdk';
import { isSmallViewport } from '$lib/stores/viewport';
import { goto, invalidate } from '$app/navigation';
import { resolve } from '$app/paths';
import { Dependencies } from '$lib/constants';
import { addNotification } from '$lib/stores/notifications';
import { Submit, trackError } from '$lib/actions/analytics';
import { generateFingerprintToken } from '$lib/helpers/fingerprint';
import { Alert, Layout, Link, Modal, Typography } from '@appwrite.io/pink-svelte';
import { Status } from '@appwrite.io/console';

export default function PausedProjectModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { show = false, projectId, teamId } = $$props;
		let loading = false;
		let error = null;

		async function handleResume() {
			loading = true;
			error = null;

			try {
				const fingerprint = await generateFingerprintToken();

				sdk.forConsole.client.headers['X-Appwrite-Console-Fingerprint'] = fingerprint;

				try {
					await sdk.forConsole.projects.updateStatus({ projectId, status: Status.Active });
				} finally {
					delete sdk.forConsole.client.headers['X-Appwrite-Console-Fingerprint'];
				}

				addNotification({ type: 'success', message: 'Project resumed successfully' });

				// Reload project data to get updated consoleAccessedAt
				await invalidate(Dependencies.PROJECT);

				show = false;
			} catch(e) {
				const message = e && typeof e === 'object' && 'message' in e
					? String(e.message)
					: 'Failed to resume project. Please try again.';

				error = message;
				trackError(e, Submit.ProjectResume);
			} finally {
				loading = false;
			}
		}

		function handleUpgrade() {
			goto(resolve('/(console)/organization-[organization]/change-plan', { organization: teamId }));
		}

		function handleBackToOrganization() {
			goto(resolve('/(console)/organization-[organization]', { organization: teamId }));
		}

		const upgradeHref = $.derived(() => resolve('/(console)/organization-[organization]/change-plan', { organization: teamId }));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Modal($$renderer, {
				title: 'Project paused',
				size: 'm',
				dismissible: false,
				get open() {
					return show;
				},

				set open($$value) {
					show = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							gap: 'm',
							children: ($$renderer) => {
								if (Typography.Text) {
									$$renderer.push('<!--[-->');

									Typography.Text($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->This project has been paused due to inactivity.`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Typography.Text) {
									$$renderer.push('<!--[-->');

									Typography.Text($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Your data is safe and will remain intact. `);

											if ($.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport)) {
												$$renderer.push('<!--[0-->');

												if (Link.Anchor) {
													$$renderer.push('<!--[-->');

													Link.Anchor($$renderer, {
														href: upgradeHref(),
														children: ($$renderer) => {
															$$renderer.push(`<!---->Upgrade your plan`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` to keep your projects
                active, or restore the project to continue using it.`);
											} else {
												$$renderer.push(`<!--[-1-->Upgrade your plan to keep your projects active, or restore the project to continue
                using it.`);
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

								$$renderer.push(` `);

								if (error) {
									$$renderer.push('<!--[0-->');

									if (Alert.Inline) {
										$$renderer.push('<!--[-->');

										Alert.Inline($$renderer, {
											status: 'error',
											dismissible: true,
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(error)}`);
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

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},

				$$slots: {
					default: true,
					footer: ($$renderer) => {
						{
							if ($.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport)) {
								$$renderer.push('<!--[0-->');

								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										gap: 'xs',
										children: ($$renderer) => {
											Button($$renderer, {
												disabled: loading,
												fullWidth: true,
												children: ($$renderer) => {
													if (loading) {
														$$renderer.push(`<!--[0-->Restoring...`);
													} else {
														$$renderer.push(`<!--[-1-->Restore project`);
													}

													$$renderer.push(`<!--]-->`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Button($$renderer, {
												text: true,
												disabled: loading,
												fullWidth: true,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Go to organization`);
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
							} else {
								$$renderer.push('<!--[-1-->');

								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										direction: 'row',
										justifyContent: 'space-between',
										children: ($$renderer) => {
											Button($$renderer, {
												text: true,
												disabled: loading,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Back to organization`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											if (Layout.Stack) {
												$$renderer.push('<!--[-->');

												Layout.Stack($$renderer, {
													direction: 'row',
													justifyContent: 'flex-end',
													children: ($$renderer) => {
														Button($$renderer, {
															secondary: true,
															disabled: loading,
															children: ($$renderer) => {
																if (loading) {
																	$$renderer.push(`<!--[0-->Restoring...`);
																} else {
																	$$renderer.push(`<!--[-1-->Restore project`);
																}

																$$renderer.push(`<!--]-->`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);

														Button($$renderer, {
															disabled: loading,
															children: ($$renderer) => {
																$$renderer.push(`<!---->Upgrade`);
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
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(`<!--]-->`);
						}
					}
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { show });
	});
}