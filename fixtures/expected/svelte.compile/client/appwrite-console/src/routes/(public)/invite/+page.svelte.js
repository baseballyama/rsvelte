import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <div><!></div>`, 1);
var root_1 = $.from_html(`By accepting the invitation, you agree to the <!> and <!>.`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

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

	$.head('8gkwln', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Accept invite - Appwrite';
		});
	});

	Unauthenticated($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
						Layout_Stack($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_2 = $.first_child(fragment_3);

								$.component(node_2, () => Alert.Inline, ($$anchor, Alert_Inline) => {
									Alert_Inline($$anchor, {
										status: 'warning',
										title: 'The invite link is not valid',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Please ask the project owner to send you a new invite.');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								});

								var div = $.sibling(node_2, 2);
								var node_3 = $.child(div);

								{
									let $0 = $.derived(() => `${base}/register`);

									Button(node_3, {
										get href() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Sign up to Appwrite');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});
								}

								$.reset(div);
								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var fragment_4 = $.comment();
					var node_4 = $.first_child(fragment_4);

					$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
						Layout_Stack_1($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = root_2();
								var node_5 = $.first_child(fragment_5);

								$.component(node_5, () => Typography.Text, ($$anchor, Typography_Text) => {
									Typography_Text($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('You have been invited to join an organization on Appwrite');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								});

								var node_6 = $.sibling(node_5, 2);

								Form(node_6, {
									onSubmit: acceptInvite,
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = $.comment();
										var node_7 = $.first_child(fragment_6);

										$.component(node_7, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
											Layout_Stack_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root_2();
													var node_8 = $.first_child(fragment_7);

													InputChoice(node_8, {
														required: true,
														id: 'terms',
														label: 'terms',
														showLabel: false,
														get value() {
															return terms;
														},

														set value($$value) {
															terms = $$value;
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_8 = root_1();
															var node_9 = $.sibling($.first_child(fragment_8));

															$.component(node_9, () => Link.Anchor, ($$anchor, Link_Anchor) => {
																Link_Anchor($$anchor, {
																	href: 'https://appwrite.io/terms',
																	target: '_blank',
																	rel: 'noopener noreferrer',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('Terms and Conditions');

																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															var node_10 = $.sibling(node_9, 2);

															$.component(node_10, () => Link.Anchor, ($$anchor, Link_Anchor_1) => {
																Link_Anchor_1($$anchor, {
																	href: 'https://appwrite.io/privacy',
																	target: '_blank',
																	rel: 'noopener noreferrer',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('Privacy Policy');

																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});
															});

															$.next();
															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});

													var node_11 = $.sibling(node_8, 2);

													$.component(node_11, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
														Layout_Stack_3($$anchor, {
															direction: 'row',
															children: ($$anchor, $$slotProps) => {
																var fragment_9 = root_2();
																var node_12 = $.first_child(fragment_9);

																{
																	let $0 = $.derived(() => `${base}/login`);

																	Button(node_12, {
																		secondary: true,
																		get href() {
																			return $.get($0);
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_5 = $.text('Cancel');

																			$.append($$anchor, text_5);
																		},
																		$$slots: { default: true }
																	});
																}

																var node_13 = $.sibling(node_12, 2);

																{
																	let $0 = $.derived(() => !terms);

																	Button(node_13, {
																		submit: true,
																		get disabled() {
																			return $.get($0);
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_6 = $.text('Accept');

																			$.append($$anchor, text_6);
																		},
																		$$slots: { default: true }
																	});
																}

																$.append($$anchor, fragment_9);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				};

				$.if(node, ($$render) => {
					if (!userId || !secret || !membershipId || !teamId) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var fragment_10 = $.comment();
				var node_14 = $.first_child(fragment_10);

				{
					var consequent_1 = ($$anchor) => {
						var text_7 = $.text('Invalid invite');

						$.append($$anchor, text_7);
					};

					var alternate_1 = ($$anchor) => {
						var text_8 = $.text('Invite');

						$.append($$anchor, text_8);
					};

					$.if(node_14, ($$render) => {
						if (!userId || !secret || !membershipId || !teamId) $$render(consequent_1); else $$render(alternate_1, -1);
					});
				}

				$.append($$anchor, fragment_10);
			}
		}
	});

	$.pop();
}