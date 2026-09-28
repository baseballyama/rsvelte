import * as $ from 'svelte/internal/server';
import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import CircleAlert from '@lucide/svelte/icons/circle-alert';
import * as Dialog from '$lib/components/ui/dialog';
import { PROJECT_NAME } from '$lib/config';

export default function Dialog_08($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let inputValue = '';
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					children: ($$renderer) => {
						if (Dialog.Trigger) {
							$$renderer.push('<!--[-->');

							Dialog.Trigger($$renderer, {
								class: buttonVariants({ variant: 'outline' }),
								children: ($$renderer) => {
									$$renderer.push(`<!---->Delete project`);
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
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex flex-col items-center gap-2"><div class="border-border flex size-9 shrink-0 items-center justify-center rounded-full border" aria-hidden="true">`);
									CircleAlert($$renderer, { class: 'opacity-80', size: 16 });
									$$renderer.push(`<!----></div> `);

									if (Dialog.Header) {
										$$renderer.push('<!--[-->');

										Dialog.Header($$renderer, {
											children: ($$renderer) => {
												if (Dialog.Title) {
													$$renderer.push('<!--[-->');

													Dialog.Title($$renderer, {
														class: 'sm:text-center',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Final confirmation`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Dialog.Description) {
													$$renderer.push('<!--[-->');

													Dialog.Description($$renderer, {
														class: 'sm:text-center',
														children: ($$renderer) => {
															$$renderer.push(`<!---->This action cannot be undone. To confirm, please enter the project name <span class="text-foreground">${$.escape(PROJECT_NAME)}</span>.`);
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

									$$renderer.push(`</div> <form class="space-y-5"><div class="space-y-2">`);

									Label($$renderer, {
										for: 'project-name',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Project name`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'project-name',
										type: 'text',
										placeholder: `Type ${$.stringify(PROJECT_NAME)} to confirm`,
										get value() {
											return inputValue;
										},

										set value($$value) {
											inputValue = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div> `);

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											children: ($$renderer) => {
												if (Dialog.Close) {
													$$renderer.push('<!--[-->');

													Dialog.Close($$renderer, {
														class: `${$.stringify(buttonVariants({ variant: 'outline' }))} flex-1`,
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

												Button($$renderer, {
													type: 'button',
													class: 'flex-1',
													disabled: inputValue !== PROJECT_NAME,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Delete`);
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

									$$renderer.push(`</form>`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}