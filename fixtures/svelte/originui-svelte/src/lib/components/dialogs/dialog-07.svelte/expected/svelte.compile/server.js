import * as $ from 'svelte/internal/server';
import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
import * as Dialog from '$lib/components/ui/dialog';

export default function Dialog_07($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let content = void 0;
		let hasReadToBottom = false;

		function handleScroll() {
			const scrollPercentage = content.scrollTop / (content.scrollHeight - content.clientHeight);

			if (scrollPercentage >= 0.99 && !hasReadToBottom) {
				hasReadToBottom = true;
			}
		}

		if (Dialog.Root) {
			$$renderer.push('<!--[-->');

			Dialog.Root($$renderer, {
				children: ($$renderer) => {
					if (Dialog.Trigger) {
						$$renderer.push('<!--[-->');

						Dialog.Trigger($$renderer, {
							class: buttonVariants({ variant: 'outline' }),
							children: ($$renderer) => {
								$$renderer.push(`<!---->Terms &amp; Conditions`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Dialog.Content) {
						$$renderer.push('<!--[-->');

						Dialog.Content($$renderer, {
							class: 'flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:top-3.5',
							children: ($$renderer) => {
								if (Dialog.Header) {
									$$renderer.push('<!--[-->');

									Dialog.Header($$renderer, {
										class: 'contents space-y-0 text-left',
										children: ($$renderer) => {
											if (Dialog.Title) {
												$$renderer.push('<!--[-->');

												Dialog.Title($$renderer, {
													class: 'border-border border-b px-6 py-4 text-base',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Terms &amp; Conditions`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` <div class="overflow-y-auto">`);

											if (Dialog.Description) {
												$$renderer.push('<!--[-->');

												Dialog.Description($$renderer, {
													class: 'px-6 py-4',
													children: ($$renderer) => {
														$$renderer.push(`<div class="[&amp;_strong]:text-foreground space-y-4 [&amp;_strong]:font-semibold"><div class="space-y-4"><div class="space-y-1"><p><strong>Acceptance of Terms</strong></p> <p>By accessing and using this website, users agree to comply with and be bound by
									these Terms of Service. Users who do not agree with these terms should discontinue
									use of the website immediately.</p></div> <div class="space-y-1"><p><strong>User Account Responsibilities</strong></p> <p>Users are responsible for maintaining the confidentiality of their account
									credentials. Any activities occurring under a user‘s account are the sole
									responsibility of the account holder. Users must notify the website administrators
									immediately of any unauthorized account access.</p></div> <div class="space-y-1"><p><strong>Content Usage and Restrictions</strong></p> <p>The website and its original content are protected by intellectual property laws.
									Users may not reproduce, distribute, modify, create derivative works, or
									commercially exploit any content without explicit written permission from the
									website owners.</p></div> <div class="space-y-1"><p><strong>Limitation of Liability</strong></p> <p>The website provides content “as is“ without any warranties. The
									website owners shall not be liable for direct, indirect, incidental,
									consequential, or punitive damages arising from user interactions with the
									platform.</p></div> <div class="space-y-1"><p><strong>User Conduct Guidelines</strong></p> <ul class="list-disc pl-6"><li>Not upload harmful or malicious content</li> <li>Respect the rights of other users</li> <li>Avoid activities that could disrupt website functionality</li> <li>Comply with applicable local and international laws</li></ul></div> <div class="space-y-1"><p><strong>Modifications to Terms</strong></p> <p>The website reserves the right to modify these terms at any time. Continued use of
									the website after changes constitutes acceptance of the new terms.</p></div> <div class="space-y-1"><p><strong>Termination Clause</strong></p> <p>The website may terminate or suspend user access without prior notice for
									violations of these terms or for any other reason deemed appropriate by the
									administration.</p></div> <div class="space-y-1"><p><strong>Governing Law</strong></p> <p>These terms are governed by the laws of the jurisdiction where the website is
									primarily operated, without regard to conflict of law principles.</p></div></div></div>`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(`</div>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Dialog.Footer) {
									$$renderer.push('<!--[-->');

									Dialog.Footer($$renderer, {
										class: 'border-border border-t px-6 py-4 sm:items-center',
										children: ($$renderer) => {
											if (!hasReadToBottom) {
												$$renderer.push(`<!--[0--><span class="text-muted-foreground grow text-xs max-sm:text-center">Read all terms before accepting.</span>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--> `);

											if (Dialog.Close) {
												$$renderer.push('<!--[-->');

												Dialog.Close($$renderer, {
													class: buttonVariants({ variant: 'outline' }),
													children: ($$renderer) => {
														$$renderer.push(`<!---->Cancel`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											{
												function child($$renderer, { props }) {
													Button($$renderer, $.spread_props([
														props,
														{
															disabled: !hasReadToBottom,
															children: ($$renderer) => {
																$$renderer.push(`<!---->I agree`);
															},
															$$slots: { default: true }
														}
													]));
												}

												if (Dialog.Close) {
													$$renderer.push('<!--[-->');
													Dialog.Close($$renderer, { child, $$slots: { child: true } });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
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
	});
}