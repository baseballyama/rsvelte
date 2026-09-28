import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { Button, Form, InputChoice } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Unauthenticated } from '$lib/layout';
import { page } from '$app/state';
import { onMount } from 'svelte';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { Layout, Link, Typography, Alert } from '@appwrite.io/pink-svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let teamId;
		let membershipId;
		let userId;
		let secret;
		let terms = false;

		onMount(() => {
			userId = page.url.searchParams.get('userId');
			secret = page.url.searchParams.get('secret');
			teamId = page.url.searchParams.get('teamId');
			membershipId = page.url.searchParams.get('membershipId');
		});

		const acceptInvite = async () => {
			try {
				await sdk.forConsole.teams.updateMembershipStatus({ teamId, membershipId, userId, secret });

				addNotification({
					type: 'success',
					message: 'Successfully joined the organization.'
				});

				await goto(`${base}/organization-${teamId}`);
				trackEvent(Submit.MembershipUpdateStatus);
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.MembershipUpdateStatus);
			}
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('8gkwln', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Accept invite - Appwrite</title>`);
				});
			});

			Unauthenticated($$renderer, {
				children: ($$renderer) => {
					{
						if (!userId || !secret || !membershipId || !teamId) {
							$$renderer.push('<!--[0-->');

							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									children: ($$renderer) => {
										if (Alert.Inline) {
											$$renderer.push('<!--[-->');

											Alert.Inline($$renderer, {
												status: 'warning',
												title: 'The invite link is not valid',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Please ask the project owner to send you a new invite.`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` <div>`);

										Button($$renderer, {
											href: `${base}/register`,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Sign up to Appwrite`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div>`);
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
									children: ($$renderer) => {
										if (Typography.Text) {
											$$renderer.push('<!--[-->');

											Typography.Text($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->You have been invited to join an organization on Appwrite`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										Form($$renderer, {
											onSubmit: acceptInvite,
											children: ($$renderer) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														children: ($$renderer) => {
															InputChoice($$renderer, {
																required: true,
																id: 'terms',
																label: 'terms',
																showLabel: false,
																get value() {
																	return terms;
																},

																set value($$value) {
																	terms = $$value;
																	$$settled = false;
																},

																children: ($$renderer) => {
																	$$renderer.push(`<!---->By accepting the invitation, you agree to the `);

																	if (Link.Anchor) {
																		$$renderer.push('<!--[-->');

																		Link.Anchor($$renderer, {
																			href: 'https://appwrite.io/terms',
																			target: '_blank',
																			rel: 'noopener noreferrer',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Terms and Conditions`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` and `);

																	if (Link.Anchor) {
																		$$renderer.push('<!--[-->');

																		Link.Anchor($$renderer, {
																			href: 'https://appwrite.io/privacy',
																			target: '_blank',
																			rel: 'noopener noreferrer',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Privacy Policy`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(`.`);
																},
																$$slots: { default: true }
															});

															$$renderer.push(`<!----> `);

															if (Layout.Stack) {
																$$renderer.push('<!--[-->');

																Layout.Stack($$renderer, {
																	direction: 'row',
																	children: ($$renderer) => {
																		Button($$renderer, {
																			secondary: true,
																			href: `${base}/login`,
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Cancel`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push(`<!----> `);

																		Button($$renderer, {
																			submit: true,
																			disabled: !terms,
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Accept`);
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
						}

						$$renderer.push(`<!--]-->`);
					}
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						{
							if (!userId || !secret || !membershipId || !teamId) {
								$$renderer.push(`<!--[0-->Invalid invite`);
							} else {
								$$renderer.push(`<!--[-1-->Invite`);
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
	});
}