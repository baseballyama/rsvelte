import * as $ from 'svelte/internal/server';
import { buttonVariants } from '$lib/components/ui/button.svelte';
import CircleAlert from '@lucide/svelte/icons/circle-alert';
import * as AlertDialog from '$lib/components/ui/alert-dialog';

export default function Dialog_02($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (AlertDialog.Root) {
			$$renderer.push('<!--[-->');

			AlertDialog.Root($$renderer, {
				children: ($$renderer) => {
					if (AlertDialog.Trigger) {
						$$renderer.push('<!--[-->');

						AlertDialog.Trigger($$renderer, {
							class: buttonVariants({ variant: 'outline' }),
							children: ($$renderer) => {
								$$renderer.push(`<!---->Alert dialog with icon`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (AlertDialog.Content) {
						$$renderer.push('<!--[-->');

						AlertDialog.Content($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<div class="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4"><div class="border-border flex size-9 shrink-0 items-center justify-center rounded-full border" aria-hidden="true">`);
								CircleAlert($$renderer, { class: 'opacity-80', size: 16 });
								$$renderer.push(`<!----></div> `);

								if (AlertDialog.Header) {
									$$renderer.push('<!--[-->');

									AlertDialog.Header($$renderer, {
										children: ($$renderer) => {
											if (AlertDialog.Title) {
												$$renderer.push('<!--[-->');

												AlertDialog.Title($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Are you sure?`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (AlertDialog.Description) {
												$$renderer.push('<!--[-->');

												AlertDialog.Description($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Are you sure you want to delete your account? All your data will be removed.`);
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

								$$renderer.push(`</div> `);

								if (AlertDialog.Footer) {
									$$renderer.push('<!--[-->');

									AlertDialog.Footer($$renderer, {
										children: ($$renderer) => {
											if (AlertDialog.Cancel) {
												$$renderer.push('<!--[-->');

												AlertDialog.Cancel($$renderer, {
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

											if (AlertDialog.Action) {
												$$renderer.push('<!--[-->');

												AlertDialog.Action($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Confirm`);
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