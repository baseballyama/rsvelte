import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Base from './base.svelte';
import { isCloud } from '$lib/system';
import { getChangePlanUrl } from '$lib/stores/billing';
import { organization } from '$lib/stores/organization';
import Button from '$lib/elements/forms/button.svelte';
import { Badge, Layout, Link, Typography } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<span class="u-bold">Roles</span>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <p class="u-flex u-main-end u-cross-center u-gap-4"><!> <!></p>`, 1);

export default function Upgrade($$anchor, $$props) {
	$.push($$props, true);

	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	Base($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					gap: 's',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						{
							var consequent_1 = ($$anchor) => {
								var fragment_3 = $.comment();
								var node_2 = $.first_child(fragment_3);

								{
									var consequent = ($$anchor) => {
										var fragment_4 = root();
										var node_3 = $.first_child(fragment_4);

										$.component(node_3, () => Typography.Text, ($$anchor, Typography_Text) => {
											Typography_Text($$anchor, {
												variant: 'm-600',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Roles');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => Typography.Text, ($$anchor, Typography_Text_1) => {
											Typography_Text_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Owner, Developer, Editor, Analyst and Billing.');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Typography.Text, ($$anchor, Typography_Text_2) => {
											Typography_Text_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = $.comment();
													var node_6 = $.first_child(fragment_5);

													$.component(node_6, () => Link.Anchor, ($$anchor, Link_Anchor) => {
														Link_Anchor($$anchor, {
															target: '_blank',
															rel: 'noopener noreferrer',
															href: 'https://appwrite.io/docs/advanced/platform/roles',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Learn more');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									};

									var alternate = ($$anchor) => {
										var fragment_6 = root_3();
										var node_7 = $.first_child(fragment_6);

										$.component(node_7, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
											Layout_Stack_1($$anchor, {
												direction: 'row',
												gap: 's',
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root_2();
													var node_8 = $.first_child(fragment_7);

													$.component(node_8, () => Typography.Text, ($$anchor, Typography_Text_3) => {
														Typography_Text_3($$anchor, {
															variant: 'm-600',
															children: ($$anchor, $$slotProps) => {
																var span = root_1();

																$.append($$anchor, span);
															},
															$$slots: { default: true }
														});
													});

													var node_9 = $.sibling(node_8, 2);

													Badge(node_9, { variant: 'secondary', size: 'xs', content: 'Pro plan' });
													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										});

										var node_10 = $.sibling(node_7, 2);

										$.component(node_10, () => Typography.Text, ($$anchor, Typography_Text_4) => {
											Typography_Text_4($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Upgrade to Pro to assign new roles to members such as Owner, Developer, Editor\n                    or Analyst.');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var p = $.sibling(node_10, 2);
										var node_11 = $.child(p);

										Button(node_11, {
											size: 's',
											text: true,
											external: true,
											href: 'https://appwrite.io/docs/advanced/platform/roles',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Learn more');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});

										var node_12 = $.sibling(node_11, 2);

										{
											let $0 = $.derived(() => getChangePlanUrl($organization()?.$id));

											Button(node_12, {
												size: 's',
												secondary: true,
												external: true,
												get href() {
													return $.get($0);
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Upgrade plan');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										}

										$.reset(p);
										$.append($$anchor, fragment_6);
									};

									$.if(node_2, ($$render) => {
										if ($organization()?.billingPlanDetails.supportsOrganizationRoles) $$render(consequent); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_3);
							};

							var alternate_1 = ($$anchor) => {
								var fragment_8 = root_3();
								var node_13 = $.first_child(fragment_8);

								$.component(node_13, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
									Layout_Stack_2($$anchor, {
										direction: 'row',
										gap: 's',
										children: ($$anchor, $$slotProps) => {
											var fragment_9 = root_2();
											var node_14 = $.first_child(fragment_9);

											$.component(node_14, () => Typography.Text, ($$anchor, Typography_Text_5) => {
												Typography_Text_5($$anchor, {
													variant: 'm-600',
													children: ($$anchor, $$slotProps) => {
														var span_1 = root_1();

														$.append($$anchor, span_1);
													},
													$$slots: { default: true }
												});
											});

											var node_15 = $.sibling(node_14, 2);

											Badge(node_15, { variant: 'secondary', size: 'xs', content: 'Cloud' });
											$.append($$anchor, fragment_9);
										},
										$$slots: { default: true }
									});
								});

								var node_16 = $.sibling(node_13, 2);

								$.component(node_16, () => Typography.Text, ($$anchor, Typography_Text_6) => {
									Typography_Text_6($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('Upgrade to Cloud to assign new roles to members or ask us about our enterprise self\n                hosted offering.');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});
								});

								var p_1 = $.sibling(node_16, 2);
								var node_17 = $.child(p_1);

								Button(node_17, {
									size: 's',
									text: true,
									external: true,
									href: 'https://appwrite.io/docs/advanced/platform/roles',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_7 = $.text('Learn more');

										$.append($$anchor, text_7);
									},
									$$slots: { default: true }
								});

								var node_18 = $.sibling(node_17, 2);

								{
									let $0 = $.derived(() => getChangePlanUrl($organization()?.$id));

									Button(node_18, {
										size: 's',
										secondary: true,
										external: true,
										get href() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_8 = $.text('Upgrade to Cloud');

											$.append($$anchor, text_8);
										},
										$$slots: { default: true }
									});
								}

								$.reset(p_1);
								$.append($$anchor, fragment_8);
							};

							$.if(node_1, ($$render) => {
								if (isCloud) $$render(consequent_1); else $$render(alternate_1, -1);
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}