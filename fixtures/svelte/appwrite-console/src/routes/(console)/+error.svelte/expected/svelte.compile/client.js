import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { base, resolve } from '$app/paths';
import { page } from '$app/state';
import { Button } from '$lib/elements/forms';
import { isVerifyEmailRedirectError } from '$lib/helpers/emailVerification';
import { Container } from '$lib/layout';
import { Badge, Layout, Typography } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <div class="u-margin-block-start-16"><!></div>`, 1);
var root_2 = $.from_html(`<section class="budget-error svelte-1sj2ks6"><div class="budget-error__content svelte-1sj2ks6"><!></div></section>`);
var root_3 = $.from_html(`<div><!> <!></div> <div><!></div>`, 1);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	const isPaymentError = $.derived(() => page.status === 402);

	const billingUrl = $.derived(() => page.params.organization
		? `${base}/organization-${page.params.organization}/billing`
		: null);

	$.user_effect(() => {
		const verifyEmailPath = resolve('/verify-email');

		if (isVerifyEmailRedirectError(page.error) && page.url.pathname !== verifyEmailPath) {
			goto(verifyEmailPath, { replaceState: true });
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var section = root_2();
			var div = $.child(section);
			var node_1 = $.child(div);

			$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					gap: 's',
					alignItems: 'center',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_1();
						var node_2 = $.first_child(fragment_1);

						Badge(node_2, {
							type: 'error',
							variant: 'secondary',
							content: 'Billing limit reached'
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
							Layout_Stack_1($$anchor, {
								gap: 'xs',
								alignItems: 'center',
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root();
									var node_4 = $.first_child(fragment_2);

									$.component(node_4, () => Typography.Title, ($$anchor, Typography_Title) => {
										Typography_Title($$anchor, {
											size: 'l',
											align: 'center',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Your organization has reached a billing limit');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => Typography.Text, ($$anchor, Typography_Text) => {
										Typography_Text($$anchor, {
											align: 'center',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text();

												$.template_effect(() => $.set_text(text_1, page.error.message));
												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});
						});

						var div_1 = $.sibling(node_3, 2);
						var node_6 = $.child(div_1);

						$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
							Layout_Stack_2($$anchor, {
								direction: 'row',
								gap: 's',
								justifyContent: 'center',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_7 = $.first_child(fragment_4);

									{
										var consequent = ($$anchor) => {
											Button($$anchor, {
												get href() {
													return $.get(billingUrl);
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Go to billing');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										};

										$.if(node_7, ($$render) => {
											if ($.get(billingUrl)) $$render(consequent);
										});
									}

									var node_8 = $.sibling(node_7, 2);

									Button(node_8, {
										secondary: true,
										get href() {
											return `${base ?? ''}/account/organizations`;
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Change organization');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_1);
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.reset(section);
			$.append($$anchor, section);
		};

		var alternate = ($$anchor) => {
			Container($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_3();
					var div_2 = $.first_child(fragment_7);
					var node_9 = $.child(div_2);

					$.component(node_9, () => Typography.Title, ($$anchor, Typography_Title_1) => {
						Typography_Title_1($$anchor, {
							size: 'xl',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_4 = $.text();

								$.template_effect(() => $.set_text(text_4, 'status' in page.error
									? page.error.status || 'Invalid Argument'
									: 'Invalid Argument'));

								$.append($$anchor, text_4);
							},
							$$slots: { default: true }
						});
					});

					var node_10 = $.sibling(node_9, 2);

					$.component(node_10, () => Typography.Title, ($$anchor, Typography_Title_2) => {
						Typography_Title_2($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_5 = $.text();

								$.template_effect(() => $.set_text(text_5, page.error.message));
								$.append($$anchor, text_5);
							},
							$$slots: { default: true }
						});
					});

					$.reset(div_2);

					var div_3 = $.sibling(div_2, 2);
					var node_11 = $.child(div_3);

					Button(node_11, {
						get href() {
							return base;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Back to the console');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					$.reset(div_3);
					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if ($.get(isPaymentError)) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}