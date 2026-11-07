import * as $ from 'svelte/internal/server';
import Input from '../ui/input.svelte';
import Textarea from '../ui/textarea.svelte';
import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
import Label from '$lib/components/ui/label.svelte';
import { useCharacterLimit } from '$lib/hooks/use-character-limit.svelte';
import { useImageUpload } from '$lib/hooks/use-image-upload.svelte';
import Check from '@lucide/svelte/icons/check';
import ImagePlus from '@lucide/svelte/icons/image-plus';
import X from '@lucide/svelte/icons/x';
import * as Dialog from '$lib/components/ui/dialog';

export default function Dialog_19($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const id = $.props_id($$renderer);
		const bioLimit = useCharacterLimit(180, 'Hey, I am Margaret, a web developer who loves turning ideas into amazing websites!');
		const bannerImageHandler = useImageUpload({ initialImage: '/profile-bg.jpg' });
		const profileImageHandler = useImageUpload({ initialImage: '/avatar-72-01.jpg' });

		function ProfileBg($$renderer) {
			$$renderer.push(`<div class="h-32"><div class="bg-muted relative flex h-full w-full items-center justify-center overflow-hidden">`);

			if (bannerImageHandler.previewUrl) {
				$$renderer.push(`<!--[0--><img class="h-full w-full object-cover"${$.attr('src', bannerImageHandler.previewUrl)}${$.attr('alt', bannerImageHandler.fileName
					? 'Preview of uploaded image'
					: 'Default profile background')}${$.attr('width', 512)}${$.attr('height', 96)}/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="absolute inset-0 flex items-center justify-center gap-2"><button type="button" class="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"${$.attr('aria-label', bannerImageHandler.previewUrl ? 'Change image' : 'Upload image')}>`);
			ImagePlus($$renderer, { size: 16, 'aria-hidden': 'true' });
			$$renderer.push(`<!----></button> `);

			if (bannerImageHandler) {
				$$renderer.push(`<!--[0--><button type="button" class="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]" aria-label="Remove image">`);
				X($$renderer, { size: 16, 'aria-hidden': 'true' });
				$$renderer.push(`<!----></button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div> <input type="file" class="hidden" accept="image/*" aria-label="Upload image file"/></div>`);
		}

		function Avatar($$renderer) {
			$$renderer.push(`<div class="-mt-10 px-6"><div class="border-background bg-muted relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 shadow-xs shadow-black/10">`);

			if (profileImageHandler.previewUrl) {
				$$renderer.push(`<!--[0--><img${$.attr('src', profileImageHandler.previewUrl)} class="size-full object-cover"${$.attr('width', 80)}${$.attr('height', 80)} alt="Profile avatar"/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <button type="button" class="focus-visible:border-ring focus-visible:ring-ring/50 absolute flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]" aria-label="Change profile picture">`);
			ImagePlus($$renderer, { size: 16, 'aria-hidden': 'true' });
			$$renderer.push(`<!----></button> <input type="file" class="hidden" accept="image/*" aria-label="Upload profile picture"/></div></div>`);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									{
										variant: 'outline',
										class: buttonVariants({ variant: 'outline' })
									},
									props,
									{
										children: ($$renderer) => {
											$$renderer.push(`<!---->Edit profile`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Dialog.Trigger) {
								$$renderer.push('<!--[-->');
								Dialog.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5',
								children: ($$renderer) => {
									if (Dialog.Header) {
										$$renderer.push('<!--[-->');

										Dialog.Header($$renderer, {
											class: 'contents space-y-0 text-left',
											children: ($$renderer) => {
												if (Dialog.Title) {
													$$renderer.push('<!--[-->');

													Dialog.Title($$renderer, {
														class: 'border-b px-6 py-4 text-base',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Edit profile`);
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

									if (Dialog.Description) {
										$$renderer.push('<!--[-->');

										Dialog.Description($$renderer, {
											class: 'sr-only',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Make changes to your profile here. You can change your photo and set a username.`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` <div class="overflow-y-auto">`);
									ProfileBg($$renderer);
									$$renderer.push(`<!----> `);
									Avatar($$renderer);
									$$renderer.push(`<!----> <div class="px-6 pt-4 pb-6"><form class="space-y-4"><div class="flex flex-col gap-4 sm:flex-row"><div class="flex-1 space-y-2">`);

									Label($$renderer, {
										for: `${id}-first-name`,
										children: ($$renderer) => {
											$$renderer.push(`<!---->First name`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: `${id}-first-name`,
										placeholder: 'Matt',
										defaultValue: 'Margaret',
										type: 'text',
										required: true
									});

									$$renderer.push(`<!----></div> <div class="flex-1 space-y-2">`);

									Label($$renderer, {
										for: `${id}-last-name`,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Last name`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: `${id}-last-name`,
										placeholder: 'Welsh',
										defaultValue: 'Villard',
										type: 'text',
										required: true
									});

									$$renderer.push(`<!----></div></div> <div class="*:not-first:mt-2">`);

									Label($$renderer, {
										for: `${id}-username`,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Username`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <div class="relative">`);

									Input($$renderer, {
										id: `${id}-username`,
										class: 'peer pe-9',
										placeholder: 'Username',
										defaultValue: 'margaret-villard-69',
										type: 'text',
										required: true
									});

									$$renderer.push(`<!----> <div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50">`);
									Check($$renderer, { size: 16, class: 'text-emerald-500', 'aria-hidden': 'true' });
									$$renderer.push(`<!----></div></div></div> <div class="*:not-first:mt-2">`);

									Label($$renderer, {
										for: `${id}-website`,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Website`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <div class="flex rounded-lg shadow-xs shadow-black/5"><span class="border-input bg-background text-muted-foreground -z-10 inline-flex items-center rounded-s-md border px-3 text-sm">https://</span> `);

									Input($$renderer, {
										id: `${id}-website`,
										class: '-ms-px rounded-s-none shadow-none',
										placeholder: 'yourwebsite.com',
										defaultValue: 'www.margaret.com',
										type: 'text'
									});

									$$renderer.push(`<!----></div></div> <div class="*:not-first:mt-2">`);

									Label($$renderer, {
										for: `${id}-bio`,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Biography`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Textarea($$renderer, {
										id: `${id}-bio`,
										maxlength: bioLimit.maxLength,
										placeholder: 'Write a few sentences about yourself',
										'aria-describedby': `${id}-left-textarea`,
										get value() {
											return bioLimit.value;
										},

										set value($$value) {
											bioLimit.value = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> <p${$.attr('id', `${id}-left-textarea`)} class="text-muted-foreground mt-2 text-right text-xs" role="status" aria-live="polite"><span class="tabular-nums">${$.escape(bioLimit.maxLength - bioLimit.characterCount)}</span> characters left</p></div></form></div></div> `);

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											class: 'border-t px-6 py-4',
											children: ($$renderer) => {
												{
													function child($$renderer, { props }) {
														Button($$renderer, $.spread_props([
															{ type: 'button', variant: 'outline' },
															props,
															{
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Cancel`);
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

												$$renderer.push(` `);

												{
													function child($$renderer, { props }) {
														Button($$renderer, $.spread_props([
															{ type: 'button' },
															props,
															{
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Save changes`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}