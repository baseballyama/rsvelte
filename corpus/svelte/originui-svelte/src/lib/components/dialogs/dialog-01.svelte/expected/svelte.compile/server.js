import * as $ from 'svelte/internal/server';
import { buttonVariants } from '$lib/components/ui/button.svelte';
import * as AlertDialog from '$lib/components/ui/alert-dialog';

export default function Dialog_01($$renderer, $$props) {
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
								$$renderer.push(`<!---->Alert dialog`);
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
														$$renderer.push(`<!---->Take a moment to review the details provided to ensure you understand the implications.`);
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

								$$renderer.push(` `);

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
														$$renderer.push(`<!---->Okay`);
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