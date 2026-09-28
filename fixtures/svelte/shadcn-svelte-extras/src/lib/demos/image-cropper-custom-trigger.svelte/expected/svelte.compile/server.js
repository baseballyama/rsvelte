import * as $ from 'svelte/internal/server';
import * as ImageCropper from '$lib/components/ui/image-cropper';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import Button from '$lib/components/button.svelte';
import EditIcon from '@lucide/svelte/icons/edit';
import { toast } from 'svelte-sonner';

export default function Image_cropper_custom_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let src = 'https://github.com/shadcn.png';
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (ImageCropper.Root) {
				$$renderer.push('<!--[-->');

				ImageCropper.Root($$renderer, {
					onUnsupportedFile: (file) => {
						toast.error(`Unsupported file type: ${file.type}`);
					},

					get src() {
						return src;
					},

					set src($$value) {
						src = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<div class="relative">`);

						if (ImageCropper.Preview) {
							$$renderer.push('<!--[-->');
							ImageCropper.Preview($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (DropdownMenu.Root) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Root($$renderer, {
								children: ($$renderer) => {
									{
										function child($$renderer, { props }) {
											Button($$renderer, $.spread_props([
												props,
												{
													class: 'absolute -bottom-3 -left-3 rounded-full',
													variant: 'outline',
													size: 'icon',
													children: ($$renderer) => {
														EditIcon($$renderer, { class: 'size-4' });
													},
													$$slots: { default: true }
												}
											]));
										}

										if (DropdownMenu.Trigger) {
											$$renderer.push('<!--[-->');
											DropdownMenu.Trigger($$renderer, { child, $$slots: { child: true } });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(` `);

									if (DropdownMenu.Content) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Content($$renderer, {
											align: 'start',
											children: ($$renderer) => {
												if (ImageCropper.UploadTrigger) {
													$$renderer.push('<!--[-->');

													ImageCropper.UploadTrigger($$renderer, {
														children: ($$renderer) => {
															if (DropdownMenu.Item) {
																$$renderer.push('<!--[-->');

																DropdownMenu.Item($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Upload a photo...`);
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

												if (DropdownMenu.Item) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Item($$renderer, {
														onclick: () => src = '',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Remove photo`);
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

						$$renderer.push(`</div> `);

						if (ImageCropper.Dialog) {
							$$renderer.push('<!--[-->');

							ImageCropper.Dialog($$renderer, {
								children: ($$renderer) => {
									if (ImageCropper.Cropper) {
										$$renderer.push('<!--[-->');
										ImageCropper.Cropper($$renderer, {});
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (ImageCropper.Controls) {
										$$renderer.push('<!--[-->');

										ImageCropper.Controls($$renderer, {
											children: ($$renderer) => {
												if (ImageCropper.Cancel) {
													$$renderer.push('<!--[-->');
													ImageCropper.Cancel($$renderer, {});
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (ImageCropper.Crop) {
													$$renderer.push('<!--[-->');
													ImageCropper.Crop($$renderer, {});
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}