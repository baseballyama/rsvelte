import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { buttonVariants } from '$lib/components/ui/button.svelte';
import * as Dialog from '$lib/components/ui/dialog';

var root = $.from_html(`<div class="[&amp;_strong]:text-foreground space-y-4 [&amp;_strong]:font-semibold"><div class="space-y-1"><p><strong>Account Management</strong></p> <p>Navigate to the registration page, provide required information, and verify your
								email address. You can sign up using your email or through social media platforms.</p></div> <div class="space-y-1"><p><strong>Password Reset Process</strong></p> <p>Users can reset their password through the account settings page. Click &quot;Forgot
								Password&quot; and follow the email verification steps to regain account access
								quickly and securely.</p></div> <div class="space-y-1"><p><strong>Service Pricing Tiers</strong></p> <p>We offer three primary subscription levels designed to meet diverse user needs:
								Basic (free with limited features), Professional (monthly fee with comprehensive
								access), and Enterprise (custom pricing with full platform capabilities).</p></div> <div class="space-y-1"><p><strong>Technical Support Channels</strong></p> <p>Customer support is accessible through multiple communication methods including
								email support, live chat during business hours, an integrated support ticket system,
								and phone support specifically for enterprise-level customers.</p></div> <div class="space-y-1"><p><strong>Data Protection Strategies</strong></p> <p>Our platform implements rigorous security measures including 256-bit SSL encryption,
								regular comprehensive security audits, strict data access controls, and compliance
								with international privacy protection standards.</p></div> <div class="space-y-1"><p><strong>Platform Compatibility</strong></p> <p>The service supports multiple device and operating system environments, including
								web browsers like Chrome and Firefox, mobile applications for iOS and Android, and
								desktop applications compatible with Windows and macOS.</p></div> <div class="space-y-1"><p><strong>Subscription Management</strong></p> <p>Subscriptions can be cancelled at any time through account settings, with pro-rated
								refunds available within 30 days of payment. Both monthly and annual billing options
								are provided, with special discounts offered for annual commitments.</p></div> <div class="space-y-1"><p><strong>Payment Method Options</strong></p> <p>We accept a wide range of payment methods including major credit cards such as Visa,
								MasterCard, and American Express, digital payment platforms like PayPal, and direct
								bank transfers. Regional payment options may also be available depending on user
								location.</p></div> <div class="space-y-1"><p><strong>Customer Support</strong></p> <p>Our dedicated customer support team is available 24/7, providing quick and efficient
								assistance to address any inquiries or issues you may have.</p></div> <div class="space-y-1"><p><strong>Privacy Policy</strong></p> <p>Our privacy policy outlines how we collect, use, and protect your personal data,
								ensuring your privacy is protected at all times.</p></div></div>`);

var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="overflow-y-auto"><!> <!></div>`);

export default function Dialog_03($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => buttonVariants({ variant: 'outline' }));

					$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
						Dialog_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Scrollable (native scrollbar)');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:hidden',
						children: ($$anchor, $$slotProps) => {
							var div = root_2();
							var node_3 = $.child(div);

							$.component(node_3, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									class: 'contents space-y-0 text-left',
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root_1();
										var node_4 = $.first_child(fragment_2);

										$.component(node_4, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												class: 'px-6 pt-6',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Frequently Asked Questions (FAQ)');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												class: 'p-6',
												children: ($$anchor, $$slotProps) => {
													var div_1 = root();

													$.append($$anchor, div_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_2);
									},
									$$slots: { default: true }
								});
							});

							var node_6 = $.sibling(node_3, 2);

							$.component(node_6, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									class: 'px-6 pb-6 sm:justify-start',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_1();
										var node_7 = $.first_child(fragment_3);

										{
											let $0 = $.derived(() => buttonVariants({ variant: 'outline' }));

											$.component(node_7, () => Dialog.Close, ($$anchor, Dialog_Close) => {
												Dialog_Close($$anchor, {
													get class() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('Cancel');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});
											});
										}

										var node_8 = $.sibling(node_7, 2);

										{
											let $0 = $.derived(buttonVariants);

											$.component(node_8, () => Dialog.Close, ($$anchor, Dialog_Close_1) => {
												Dialog_Close_1($$anchor, {
													get class() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_3 = $.text('Okay');

														$.append($$anchor, text_3);
													},
													$$slots: { default: true }
												});
											});
										}

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div);
							$.append($$anchor, div);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}