import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(
	`<!> to keep your projects
                active, or restore the project to continue using it.`,
	1
);

var root_1 = $.from_html(`Your data is safe and will remain intact. <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function PausedProjectModal($$anchor, $$props) {
	$.push($$props, true);

	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let show = $.prop($$props, 'show', 15, false);
	let loading = $.state(false);
	let error = $.state(null);

	async function handleResume() {
		$.set(loading, true);
		$.set(error, null);

		try {
			const fingerprint = await generateFingerprintToken();

			sdk.forConsole.client.headers['X-Appwrite-Console-Fingerprint'] = fingerprint;

			try {
				await sdk.forConsole.projects.updateStatus({ projectId: $$props.projectId, status: Status.Active });
			} finally {
				delete sdk.forConsole.client.headers['X-Appwrite-Console-Fingerprint'];
			}

			addNotification({ type: 'success', message: 'Project resumed successfully' });

			// Reload project data to get updated consoleAccessedAt
			await invalidate(Dependencies.PROJECT);

			show(false);
		} catch(e) {
			const message = e && typeof e === 'object' && 'message' in e
				? String(e.message)
				: 'Failed to resume project. Please try again.';

			$.set(error, message, true);
			trackError(e, Submit.ProjectResume);
		} finally {
			$.set(loading, false);
		}
	}

	function handleUpgrade() {
		goto(resolve('/(console)/organization-[organization]/change-plan', { organization: $$props.teamId }));
	}

	function handleBackToOrganization() {
		goto(resolve('/(console)/organization-[organization]', { organization: $$props.teamId }));
	}

	const upgradeHref = $.derived(() => resolve('/(console)/organization-[organization]/change-plan', { organization: $$props.teamId }));

	Modal($$anchor, {
		title: 'Project paused',
		size: 'm',
		dismissible: false,
		get open() {
			return show();
		},

		set open($$value) {
			show($$value);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					gap: 'm',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Typography.Text, ($$anchor, Typography_Text) => {
							Typography_Text($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('This project has been paused due to inactivity.');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Typography.Text, ($$anchor, Typography_Text_1) => {
							Typography_Text_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_3 = root_1();
									var node_3 = $.sibling($.first_child(fragment_3));

									{
										var consequent = ($$anchor) => {
											var fragment_4 = root();
											var node_4 = $.first_child(fragment_4);

											$.component(node_4, () => Link.Anchor, ($$anchor, Link_Anchor) => {
												Link_Anchor($$anchor, {
													get href() {
														return $.get(upgradeHref);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('Upgrade your plan');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											});

											$.next();
											$.append($$anchor, fragment_4);
										};

										var alternate = ($$anchor) => {
											var text_2 = $.text('Upgrade your plan to keep your projects active, or restore the project to continue\n                using it.');

											$.append($$anchor, text_2);
										};

										$.if(node_3, ($$render) => {
											if ($isSmallViewport()) $$render(consequent); else $$render(alternate, -1);
										});
									}

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_5 = $.sibling(node_2, 2);

						{
							var consequent_1 = ($$anchor) => {
								var fragment_5 = $.comment();
								var node_6 = $.first_child(fragment_5);

								$.component(node_6, () => Alert.Inline, ($$anchor, Alert_Inline) => {
									Alert_Inline($$anchor, {
										status: 'error',
										dismissible: true,
										$$events: { dismiss: () => $.set(error, null) },
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text();

											$.template_effect(() => $.set_text(text_3, $.get(error)));
											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_5);
							};

							$.if(node_5, ($$render) => {
								if ($.get(error)) $$render(consequent_1);
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				var fragment_7 = $.comment();
				var node_7 = $.first_child(fragment_7);

				{
					var consequent_3 = ($$anchor) => {
						var fragment_8 = $.comment();
						var node_8 = $.first_child(fragment_8);

						$.component(node_8, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
							Layout_Stack_1($$anchor, {
								gap: 'xs',
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_3();
									var node_9 = $.first_child(fragment_9);

									Button(node_9, {
										get disabled() {
											return $.get(loading);
										},
										fullWidth: true,
										$$events: { click: handleResume },
										children: ($$anchor, $$slotProps) => {
											var fragment_10 = $.comment();
											var node_10 = $.first_child(fragment_10);

											{
												var consequent_2 = ($$anchor) => {
													var text_4 = $.text('Restoring...');

													$.append($$anchor, text_4);
												};

												var alternate_1 = ($$anchor) => {
													var text_5 = $.text('Restore project');

													$.append($$anchor, text_5);
												};

												$.if(node_10, ($$render) => {
													if ($.get(loading)) $$render(consequent_2); else $$render(alternate_1, -1);
												});
											}

											$.append($$anchor, fragment_10);
										},
										$$slots: { default: true }
									});

									var node_11 = $.sibling(node_9, 2);

									Button(node_11, {
										text: true,
										get disabled() {
											return $.get(loading);
										},
										fullWidth: true,
										$$events: { click: handleBackToOrganization },
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('Go to organization');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_8);
					};

					var alternate_3 = ($$anchor) => {
						var fragment_11 = $.comment();
						var node_12 = $.first_child(fragment_11);

						$.component(node_12, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
							Layout_Stack_2($$anchor, {
								direction: 'row',
								justifyContent: 'space-between',
								children: ($$anchor, $$slotProps) => {
									var fragment_12 = root_3();
									var node_13 = $.first_child(fragment_12);

									Button(node_13, {
										text: true,
										get disabled() {
											return $.get(loading);
										},
										$$events: { click: handleBackToOrganization },
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text('Back to organization');

											$.append($$anchor, text_7);
										},
										$$slots: { default: true }
									});

									var node_14 = $.sibling(node_13, 2);

									$.component(node_14, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
										Layout_Stack_3($$anchor, {
											direction: 'row',
											justifyContent: 'flex-end',
											children: ($$anchor, $$slotProps) => {
												var fragment_13 = root_3();
												var node_15 = $.first_child(fragment_13);

												Button(node_15, {
													secondary: true,
													get disabled() {
														return $.get(loading);
													},
													$$events: { click: handleResume },
													children: ($$anchor, $$slotProps) => {
														var fragment_14 = $.comment();
														var node_16 = $.first_child(fragment_14);

														{
															var consequent_4 = ($$anchor) => {
																var text_8 = $.text('Restoring...');

																$.append($$anchor, text_8);
															};

															var alternate_2 = ($$anchor) => {
																var text_9 = $.text('Restore project');

																$.append($$anchor, text_9);
															};

															$.if(node_16, ($$render) => {
																if ($.get(loading)) $$render(consequent_4); else $$render(alternate_2, -1);
															});
														}

														$.append($$anchor, fragment_14);
													},
													$$slots: { default: true }
												});

												var node_17 = $.sibling(node_15, 2);

												Button(node_17, {
													get disabled() {
														return $.get(loading);
													},
													$$events: { click: handleUpgrade },
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_10 = $.text('Upgrade');

														$.append($$anchor, text_10);
													},
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_13);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_12);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_11);
					};

					$.if(node_7, ($$render) => {
						if ($isSmallViewport()) $$render(consequent_3); else $$render(alternate_3, -1);
					});
				}

				$.append($$anchor, fragment_7);
			}
		}
	});

	$.pop();
	$$cleanup();
}