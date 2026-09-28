import * as $ from 'svelte/internal/server';
import { Trim } from '$lib/components';
import { Link } from '$lib/elements';
import { sdk } from '$lib/stores/sdk';

import {
	IconCode,
	IconExclamation,
	IconGitBranch,
	IconGitCommit,
	IconGithub,
	IconTerminal
} from '@appwrite.io/pink-icons-svelte';

import { ActionMenu, Layout, Popover, Icon, Skeleton, Typography } from '@appwrite.io/pink-svelte';
import Button from '$lib/elements/forms/button.svelte';

export default function DeploymentSource($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { deployment, resource, region, project } = $$props;
		let repository = null;

		async function loadRepository() {
			if (!resource?.installationId || !resource?.providerRepositoryId || !region || !project) {
				return;
			}

			try {
				repository = await sdk.forProject(region, project).vcs.getRepository({
					installationId: resource.installationId,
					providerRepositoryId: resource.providerRepositoryId
				});
			} catch(err) {
				console.warn(err);
			}
		}

		if (deployment.type === 'vcs') {
			$$renderer.push('<!--[0-->');

			Popover($$renderer, {
				padding: 'none',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { toggle }) => {
						$$renderer.push(`<div>`);

						$.await(
							$$renderer,
							loadRepository(),
							() => {
								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										direction: 'row',
										gap: 'xs',
										alignItems: 'center',
										children: ($$renderer) => {
											Skeleton($$renderer, { variant: 'line', width: 100, height: 20 });
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							() => {
								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										direction: 'row',
										gap: 'xs',
										alignItems: 'center',
										children: ($$renderer) => {
											Link($$renderer, {
												children: ($$renderer) => {
													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															direction: 'row',
															gap: 'xs',
															alignItems: 'center',
															children: ($$renderer) => {
																Icon($$renderer, { icon: IconGithub, size: 's' });
																$$renderer.push(`<!----> GitHub`);
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

											$$renderer.push(`<!----> `);

											if (repository?.authorized === false) {
												$$renderer.push('<!--[0-->');

												Popover($$renderer, {
													placement: 'bottom-start',
													children: $.invalid_default_snippet,
													$$slots: {
														default: ($$renderer, { toggle }) => {
															Button($$renderer, {
																extraCompact: true,
																children: ($$renderer) => {
																	Icon($$renderer, { icon: IconExclamation, size: 's', color: '--bgcolor-warning' });
																},
																$$slots: { default: true }
															});
														},

														tooltip: ($$renderer) => {
															{
																if (Typography.Text) {
																	$$renderer.push('<!--[-->');

																	Typography.Text($$renderer, {
																		variant: 'm-400',
																		color: '--fgcolor-neutral-secondary',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Integration not authorized for auto deployments.<br/> To enable, add the repository to the installation settings on `);

																			Link($$renderer, {
																				variant: 'muted',
																				external: true,
																				href: `https://github.com/settings/installations/${repository.providerInstallationId}`,
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->GitHub`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push(`<!---->.`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															}
														}
													}
												});
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
							}
						);

						$$renderer.push(`<!--]--></div>`);
					},

					tooltip: ($$renderer) => {
						{
							if (ActionMenu.Root) {
								$$renderer.push('<!--[-->');

								ActionMenu.Root($$renderer, {
									children: ($$renderer) => {
										if (ActionMenu.Item.Anchor) {
											$$renderer.push('<!--[-->');

											ActionMenu.Item.Anchor($$renderer, {
												href: deployment.providerRepositoryUrl,
												external: true,
												leadingIcon: IconGithub,
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(deployment.providerRepositoryOwner)}/${$.escape(deployment.providerRepositoryName)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (ActionMenu.Item.Anchor) {
											$$renderer.push('<!--[-->');

											ActionMenu.Item.Anchor($$renderer, {
												href: deployment.providerBranchUrl,
												external: true,
												leadingIcon: IconGitBranch,
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(deployment.providerBranch)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (deployment?.providerCommitMessage && deployment?.providerCommitHash && deployment?.providerCommitUrl) {
											$$renderer.push('<!--[0-->');

											if (ActionMenu.Item.Anchor) {
												$$renderer.push('<!--[-->');

												ActionMenu.Item.Anchor($$renderer, {
													href: deployment.providerCommitUrl,
													external: true,
													leadingIcon: IconGitCommit,
													children: ($$renderer) => {
														Trim($$renderer, {
															alternativeTrim: true,
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(deployment?.providerCommitHash?.substring(0, 7))}
                            ${$.escape(deployment.providerCommitMessage.substring(0, 15))}...`);
															},
															$$slots: { default: true }
														});
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
						}
					}
				}
			});
		} else if (deployment.type === 'manual') {
			$$renderer.push('<!--[1-->');

			if (Layout.Stack) {
				$$renderer.push('<!--[-->');

				Layout.Stack($$renderer, {
					gap: 's',
					direction: 'row',
					alignItems: 'center',
					children: ($$renderer) => {
						Icon($$renderer, { icon: IconCode, size: 's' });
						$$renderer.push(`<!----> <span>Manual</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else if (deployment.type === 'cli') {
			$$renderer.push('<!--[2-->');

			if (Layout.Stack) {
				$$renderer.push('<!--[-->');

				Layout.Stack($$renderer, {
					gap: 's',
					direction: 'row',
					alignItems: 'center',
					children: ($$renderer) => {
						Icon($$renderer, { icon: IconTerminal, size: 's' });
						$$renderer.push(`<!----> <span>CLI</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push(`<!--[-1--><span>N/A</span>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}