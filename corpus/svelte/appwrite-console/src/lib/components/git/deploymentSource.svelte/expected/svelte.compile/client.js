import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> GitHub`, 1);
var root_1 = $.from_html(`Integration not authorized for auto deployments.<br/> To enable, add the repository to the installation settings on <!>.`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div><!></div>`);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <span>Manual</span>`, 1);
var root_6 = $.from_html(`<!> <span>CLI</span>`, 1);
var root_7 = $.from_html(`<span>N/A</span>`);

export default function DeploymentSource($$anchor, $$props) {
	$.push($$props, true);

	let repository = $.state(null);

	async function loadRepository() {
		if (!$$props.resource?.installationId || !$$props.resource?.providerRepositoryId || !$$props.region || !$$props.project) {
			return;
		}

		try {
			$.set(
				repository,
				await sdk.forProject($$props.region, $$props.project).vcs.getRepository({
					installationId: $$props.resource.installationId,
					providerRepositoryId: $$props.resource.providerRepositoryId
				}),
				true
			);
		} catch(err) {
			console.warn(err);
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			Popover($$anchor, {
				padding: 'none',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const toggle = $.derived(() => $$slotProps.toggle);
						var div = root_3();
						var node_1 = $.child(div);

						$.await(
							node_1,
							loadRepository,
							($$anchor) => {
								var fragment_11 = $.comment();
								var node_9 = $.first_child(fragment_11);

								$.component(node_9, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
									Layout_Stack_2($$anchor, {
										direction: 'row',
										gap: 'xs',
										alignItems: 'center',
										children: ($$anchor, $$slotProps) => {
											Skeleton($$anchor, { variant: 'line', width: 100, height: 20 });
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_11);
							},
							($$anchor) => {
								var fragment_2 = $.comment();
								var node_2 = $.first_child(fragment_2);

								$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack) => {
									Layout_Stack($$anchor, {
										direction: 'row',
										gap: 'xs',
										alignItems: 'center',
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root_2();
											var node_3 = $.first_child(fragment_3);

											Link(node_3, {
												$$events: {
													click: (e) => {
														e.preventDefault();
														$.get(toggle)(e);
													}
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_4 = $.comment();
													var node_4 = $.first_child(fragment_4);

													$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
														Layout_Stack_1($$anchor, {
															direction: 'row',
															gap: 'xs',
															alignItems: 'center',
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = root();
																var node_5 = $.first_child(fragment_5);

																Icon(node_5, {
																	get icon() {
																		return IconGithub;
																	},
																	size: 's'
																});

																$.next();
																$.append($$anchor, fragment_5);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});

											var node_6 = $.sibling(node_3, 2);

											{
												var consequent = ($$anchor) => {
													Popover($$anchor, {
														placement: 'bottom-start',
														children: $.invalid_default_snippet,
														$$slots: {
															default: ($$anchor, $$slotProps) => {
																const toggle = $.derived(() => $$slotProps.toggle);

																Button($$anchor, {
																	extraCompact: true,
																	$$events: {
																		click: function (...$$args) {
																			$.get(toggle)?.apply(this, $$args);
																		}
																	},

																	children: ($$anchor, $$slotProps) => {
																		Icon($$anchor, {
																			get icon() {
																				return IconExclamation;
																			},
																			size: 's',
																			color: '--bgcolor-warning'
																		});
																	},
																	$$slots: { default: true }
																});
															},

															tooltip: ($$anchor, $$slotProps) => {
																var fragment_9 = $.comment();
																var node_7 = $.first_child(fragment_9);

																$.component(node_7, () => Typography.Text, ($$anchor, Typography_Text) => {
																	Typography_Text($$anchor, {
																		variant: 'm-400',
																		color: '--fgcolor-neutral-secondary',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var fragment_10 = root_1();
																			var node_8 = $.sibling($.first_child(fragment_10), 3);

																			{
																				let $0 = $.derived(() => `https://github.com/settings/installations/${$.get(repository).providerInstallationId}`);

																				Link(node_8, {
																					variant: 'muted',
																					external: true,
																					get href() {
																						return $.get($0);
																					},

																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text = $.text('GitHub');

																						$.append($$anchor, text);
																					},
																					$$slots: { default: true }
																				});
																			}

																			$.next();
																			$.append($$anchor, fragment_10);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_9);
															}
														}
													});
												};

												$.if(node_6, ($$render) => {
													if ($.get(repository)?.authorized === false) $$render(consequent);
												});
											}

											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_2);
							}
						);

						$.reset(div);
						$.append($$anchor, div);
					},

					tooltip: ($$anchor, $$slotProps) => {
						var fragment_13 = $.comment();
						var node_10 = $.first_child(fragment_13);

						$.component(node_10, () => ActionMenu.Root, ($$anchor, ActionMenu_Root) => {
							ActionMenu_Root($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_14 = root_4();
									var node_11 = $.first_child(fragment_14);

									$.component(node_11, () => ActionMenu.Item.Anchor, ($$anchor, ActionMenu_Item_Anchor) => {
										ActionMenu_Item_Anchor($$anchor, {
											get href() {
												return $$props.deployment.providerRepositoryUrl;
											},
											external: true,
											get leadingIcon() {
												return IconGithub;
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text();

												$.template_effect(() => $.set_text(text_1, `${$$props.deployment.providerRepositoryOwner ?? ''}/${$$props.deployment.providerRepositoryName ?? ''}`));
												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_12 = $.sibling(node_11, 2);

									$.component(node_12, () => ActionMenu.Item.Anchor, ($$anchor, ActionMenu_Item_Anchor_1) => {
										ActionMenu_Item_Anchor_1($$anchor, {
											get href() {
												return $$props.deployment.providerBranchUrl;
											},
											external: true,
											get leadingIcon() {
												return IconGitBranch;
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text();

												$.template_effect(() => $.set_text(text_2, $$props.deployment.providerBranch));
												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									var node_13 = $.sibling(node_12, 2);

									{
										var consequent_1 = ($$anchor) => {
											var fragment_17 = $.comment();
											var node_14 = $.first_child(fragment_17);

											$.component(node_14, () => ActionMenu.Item.Anchor, ($$anchor, ActionMenu_Item_Anchor_2) => {
												ActionMenu_Item_Anchor_2($$anchor, {
													get href() {
														return $$props.deployment.providerCommitUrl;
													},
													external: true,
													get leadingIcon() {
														return IconGitCommit;
													},

													children: ($$anchor, $$slotProps) => {
														Trim($$anchor, {
															alternativeTrim: true,
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text();

																$.template_effect(
																	($0, $1) => $.set_text(text_3, `${$0 ?? ''}
                            ${$1 ?? ''}...`),
																	[
																		() => $$props.deployment?.providerCommitHash?.substring(0, 7),
																		() => $$props.deployment.providerCommitMessage.substring(0, 15)
																	]
																);

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_17);
										};

										$.if(node_13, ($$render) => {
											if ($$props.deployment?.providerCommitMessage && $$props.deployment?.providerCommitHash && $$props.deployment?.providerCommitUrl) $$render(consequent_1);
										});
									}

									$.append($$anchor, fragment_14);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_13);
					}
				}
			});
		};

		var consequent_3 = ($$anchor) => {
			var fragment_20 = $.comment();
			var node_15 = $.first_child(fragment_20);

			$.component(node_15, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
				Layout_Stack_3($$anchor, {
					gap: 's',
					direction: 'row',
					alignItems: 'center',
					children: ($$anchor, $$slotProps) => {
						var fragment_21 = root_5();
						var node_16 = $.first_child(fragment_21);

						Icon(node_16, {
							get icon() {
								return IconCode;
							},
							size: 's'
						});

						$.next(2);
						$.append($$anchor, fragment_21);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_20);
		};

		var consequent_4 = ($$anchor) => {
			var fragment_22 = $.comment();
			var node_17 = $.first_child(fragment_22);

			$.component(node_17, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
				Layout_Stack_4($$anchor, {
					gap: 's',
					direction: 'row',
					alignItems: 'center',
					children: ($$anchor, $$slotProps) => {
						var fragment_23 = root_6();
						var node_18 = $.first_child(fragment_23);

						Icon(node_18, {
							get icon() {
								return IconTerminal;
							},
							size: 's'
						});

						$.next(2);
						$.append($$anchor, fragment_23);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_22);
		};

		var alternate = ($$anchor) => {
			var span = root_7();

			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if ($$props.deployment.type === 'vcs') $$render(consequent_2); else if ($$props.deployment.type === 'manual') $$render(consequent_3, 1); else if ($$props.deployment.type === 'cli') $$render(consequent_4, 2); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}