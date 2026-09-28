import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
import * as Dialog from '$lib/components/ui/dialog';

var root = $.from_html(`<div class="[&amp;_strong]:text-foreground space-y-4 [&amp;_strong]:font-semibold"><div class="space-y-4"><div class="space-y-1"><p><strong>Acceptance of Terms</strong></p> <p>By accessing and using this website, users agree to comply with and be bound by
									these Terms of Service. Users who do not agree with these terms should discontinue
									use of the website immediately.</p></div> <div class="space-y-1"><p><strong>User Account Responsibilities</strong></p> <p>Users are responsible for maintaining the confidentiality of their account
									credentials. Any activities occurring under a user&lsquo;s account are the sole
									responsibility of the account holder. Users must notify the website administrators
									immediately of any unauthorized account access.</p></div> <div class="space-y-1"><p><strong>Content Usage and Restrictions</strong></p> <p>The website and its original content are protected by intellectual property laws.
									Users may not reproduce, distribute, modify, create derivative works, or
									commercially exploit any content without explicit written permission from the
									website owners.</p></div> <div class="space-y-1"><p><strong>Limitation of Liability</strong></p> <p>The website provides content &ldquo;as is&ldquo; without any warranties. The
									website owners shall not be liable for direct, indirect, incidental,
									consequential, or punitive damages arising from user interactions with the
									platform.</p></div> <div class="space-y-1"><p><strong>User Conduct Guidelines</strong></p> <ul class="list-disc pl-6"><li>Not upload harmful or malicious content</li> <li>Respect the rights of other users</li> <li>Avoid activities that could disrupt website functionality</li> <li>Comply with applicable local and international laws</li></ul></div> <div class="space-y-1"><p><strong>Modifications to Terms</strong></p> <p>The website reserves the right to modify these terms at any time. Continued use of
									the website after changes constitutes acceptance of the new terms.</p></div> <div class="space-y-1"><p><strong>Termination Clause</strong></p> <p>The website may terminate or suspend user access without prior notice for
									violations of these terms or for any other reason deemed appropriate by the
									administration.</p></div> <div class="space-y-1"><p><strong>Governing Law</strong></p> <p>These terms are governed by the laws of the jurisdiction where the website is
									primarily operated, without regard to conflict of law principles.</p></div></div></div>`);

var root_1 = $.from_html(`<!> <div class="overflow-y-auto"><!></div>`, 1);
var root_2 = $.from_html(`<span class="text-muted-foreground grow text-xs max-sm:text-center">Read all terms before accepting.</span>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function Dialog_07($$anchor, $$props) {
	$.push($$props, true);

	let content = $.state(void 0);
	let hasReadToBottom = $.state(false);

	function handleScroll() {
		const scrollPercentage = $.get(content).scrollTop / ($.get(content).scrollHeight - $.get(content).clientHeight);

		if (scrollPercentage >= 0.99 && !$.get(hasReadToBottom)) {
			$.set(hasReadToBottom, true);
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_4();
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

								var text = $.text('Terms & Conditions');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:top-3.5',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_4();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									class: 'contents space-y-0 text-left',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_1();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												class: 'border-border border-b px-6 py-4 text-base',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Terms & Conditions');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var div = $.sibling(node_4, 2);
										var node_5 = $.child(div);

										$.component(node_5, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												class: 'px-6 py-4',
												children: ($$anchor, $$slotProps) => {
													var div_1 = root();

													$.append($$anchor, div_1);
												},
												$$slots: { default: true }
											});
										});

										$.reset(div);
										$.bind_this(div, ($$value) => $.set(content, $$value), () => $.get(content));
										$.event('scroll', div, handleScroll);
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_6 = $.sibling(node_3, 2);

							$.component(node_6, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									class: 'border-border border-t px-6 py-4 sm:items-center',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_3();
										var node_7 = $.first_child(fragment_4);

										{
											var consequent = ($$anchor) => {
												var span = root_2();

												$.append($$anchor, span);
											};

											$.if(node_7, ($$render) => {
												if (!$.get(hasReadToBottom)) $$render(consequent);
											});
										}

										var node_8 = $.sibling(node_7, 2);

										{
											let $0 = $.derived(() => buttonVariants({ variant: 'outline' }));

											$.component(node_8, () => Dialog.Close, ($$anchor, Dialog_Close) => {
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

										var node_9 = $.sibling(node_8, 2);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;

												{
													let $0 = $.derived(() => !$.get(hasReadToBottom));

													Button($$anchor, $.spread_props(props, {
														get disabled() {
															return $.get($0);
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('I agree');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													}));
												}
											};

											$.component(node_9, () => Dialog.Close, ($$anchor, Dialog_Close_1) => {
												Dialog_Close_1($$anchor, { child, $$slots: { child: true } });
											});
										}

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
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