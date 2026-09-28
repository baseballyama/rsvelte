import * as $ from 'svelte/internal/server';
import { Button } from './ui/button';
import Icon from './Icon.svelte';
import path from 'path';
import * as AlertDialog from '$lib/components/ui/alert-dialog';

export default function CommandDeeplinkConfirm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { plugin, open = true, onconfirm, oncancel } = $$props;
		const assetsPath = $.derived(() => path.dirname(plugin.pluginPath) + '/assets');
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (AlertDialog.Root) {
				$$renderer.push('<!--[-->');

				AlertDialog.Root($$renderer, {
					onOpenChange: (isOpen) => !isOpen && oncancel(),
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (AlertDialog.Content) {
							$$renderer.push('<!--[-->');

							AlertDialog.Content($$renderer, {
								class: 'w-fit',
								children: ($$renderer) => {
									if (AlertDialog.Header) {
										$$renderer.push('<!--[-->');

										AlertDialog.Header($$renderer, {
											class: 'items-center text-center',
											children: ($$renderer) => {
												Icon($$renderer, {
													icon: plugin.icon,
													class: 'size-16',
													assetsPath: assetsPath()
												});

												$$renderer.push(`<!----> `);

												if (AlertDialog.Title) {
													$$renderer.push('<!--[-->');

													AlertDialog.Title($$renderer, {
														class: 'text-xl font-semibold',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Request to open ${$.escape(plugin.title)}`);
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
														class: 'text-center text-sm',
														children: ($$renderer) => {
															$$renderer.push(`<!---->The command was triggered from outside of Flare. If you did not do this, please cancel the
				operation.`);
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
											class: 'mt-2 !flex-col gap-2',
											children: ($$renderer) => {
												{
													function child($$renderer, { props }) {
														Button($$renderer, $.spread_props([
															props,
															{
																onclick: onconfirm,
																class: 'w-full text-base',
																size: 'lg',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Open Command`);
																},
																$$slots: { default: true }
															}
														]));
													}

													if (AlertDialog.Action) {
														$$renderer.push('<!--[-->');
														AlertDialog.Action($$renderer, { child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(` `);

												Button($$renderer, {
													onclick: onconfirm,
													variant: 'secondary',
													class: 'w-full text-base',
													size: 'lg',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Always Open Command`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												{
													function child($$renderer, { props }) {
														Button($$renderer, $.spread_props([
															props,
															{
																variant: 'ghost',
																class: 'w-full text-base',
																size: 'lg',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Cancel`);
																},
																$$slots: { default: true }
															}
														]));
													}

													if (AlertDialog.Cancel) {
														$$renderer.push('<!--[-->');
														AlertDialog.Cancel($$renderer, { child, $$slots: { child: true } });
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { open });
	});
}