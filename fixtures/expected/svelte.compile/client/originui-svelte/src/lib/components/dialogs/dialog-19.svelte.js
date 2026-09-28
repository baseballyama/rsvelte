import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<img class="h-full w-full object-cover"/>`);
var root_1 = $.from_html(`<button type="button" class="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]" aria-label="Remove image"><!></button>`);
var root_2 = $.from_html(`<div class="h-32"><div class="bg-muted relative flex h-full w-full items-center justify-center overflow-hidden"><!> <div class="absolute inset-0 flex items-center justify-center gap-2"><button type="button" class="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"><!></button> <!></div></div> <input type="file" class="hidden" accept="image/*" aria-label="Upload image file"/></div>`);
var root_3 = $.from_html(`<img class="size-full object-cover" alt="Profile avatar"/>`);
var root_4 = $.from_html(`<div class="-mt-10 px-6"><div class="border-background bg-muted relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 shadow-xs shadow-black/10"><!> <button type="button" class="focus-visible:border-ring focus-visible:ring-ring/50 absolute flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]" aria-label="Change profile picture"><!></button> <input type="file" class="hidden" accept="image/*" aria-label="Upload profile picture"/></div></div>`);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`<!> <!> <div class="overflow-y-auto"><!> <!> <div class="px-6 pt-4 pb-6"><form class="space-y-4"><div class="flex flex-col gap-4 sm:flex-row"><div class="flex-1 space-y-2"><!> <!></div> <div class="flex-1 space-y-2"><!> <!></div></div> <div class="*:not-first:mt-2"><!> <div class="relative"><!> <div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50"><!></div></div></div> <div class="*:not-first:mt-2"><!> <div class="flex rounded-lg shadow-xs shadow-black/5"><span class="border-input bg-background text-muted-foreground -z-10 inline-flex items-center rounded-s-md border px-3 text-sm">https://</span> <!></div></div> <div class="*:not-first:mt-2"><!> <!> <p class="text-muted-foreground mt-2 text-right text-xs" role="status" aria-live="polite"><span class="tabular-nums"> </span> characters left</p></div></form></div></div> <!>`, 1);

export default function Dialog_19($$anchor, $$props) {
	const id = $.props_id();

	$.push($$props, true);

	const ProfileBg = ($$anchor) => {
		var div = root_2();
		var div_1 = $.child(div);
		var node = $.child(div_1);

		{
			var consequent = ($$anchor) => {
				var img = root();

				$.set_attribute(img, 'width', 512);
				$.set_attribute(img, 'height', 96);

				$.template_effect(() => {
					$.set_attribute(img, 'src', bannerImageHandler.previewUrl);

					$.set_attribute(img, 'alt', bannerImageHandler.fileName
						? 'Preview of uploaded image'
						: 'Default profile background');
				});

				$.append($$anchor, img);
			};

			$.if(node, ($$render) => {
				if (bannerImageHandler.previewUrl) $$render(consequent);
			});
		}

		var div_2 = $.sibling(node, 2);
		var button = $.child(div_2);
		var node_1 = $.child(button);

		ImagePlus(node_1, { size: 16, 'aria-hidden': 'true' });
		$.reset(button);

		var node_2 = $.sibling(button, 2);

		{
			var consequent_1 = ($$anchor) => {
				var button_1 = root_1();
				var node_3 = $.child(button_1);

				X(node_3, { size: 16, 'aria-hidden': 'true' });
				$.reset(button_1);

				$.delegated('click', button_1, function (...$$args) {
					bannerImageHandler.handleRemove?.apply(this, $$args);
				});

				$.append($$anchor, button_1);
			};

			$.if(node_2, ($$render) => {
				if (bannerImageHandler) $$render(consequent_1);
			});
		}

		$.reset(div_2);
		$.reset(div_1);

		var input = $.sibling(div_1, 2);

		$.bind_this(input, ($$value) => bannerImageHandler.fileInput = $$value, () => bannerImageHandler?.fileInput);
		$.reset(div);
		$.template_effect(() => $.set_attribute(button, 'aria-label', bannerImageHandler.previewUrl ? 'Change image' : 'Upload image'));

		$.delegated('click', button, function (...$$args) {
			bannerImageHandler.handleThumbnailClick?.apply(this, $$args);
		});

		$.bind_files(input, () => bannerImageHandler.files, ($$value) => bannerImageHandler.files = $$value);
		$.append($$anchor, div);
	};

	const Avatar = ($$anchor) => {
		var div_3 = root_4();
		var div_4 = $.child(div_3);
		var node_4 = $.child(div_4);

		{
			var consequent_2 = ($$anchor) => {
				var img_1 = root_3();

				$.set_attribute(img_1, 'width', 80);
				$.set_attribute(img_1, 'height', 80);
				$.template_effect(() => $.set_attribute(img_1, 'src', profileImageHandler.previewUrl));
				$.append($$anchor, img_1);
			};

			$.if(node_4, ($$render) => {
				if (profileImageHandler.previewUrl) $$render(consequent_2);
			});
		}

		var button_2 = $.sibling(node_4, 2);
		var node_5 = $.child(button_2);

		ImagePlus(node_5, { size: 16, 'aria-hidden': 'true' });
		$.reset(button_2);

		var input_1 = $.sibling(button_2, 2);

		$.bind_this(input_1, ($$value) => profileImageHandler.fileInput = $$value, () => profileImageHandler?.fileInput);
		$.reset(div_4);
		$.reset(div_3);

		$.delegated('click', button_2, function (...$$args) {
			profileImageHandler.handleThumbnailClick?.apply(this, $$args);
		});

		$.bind_files(input_1, () => profileImageHandler.files, ($$value) => profileImageHandler.files = $$value);
		$.append($$anchor, div_3);
	};

	const bioLimit = useCharacterLimit(180, 'Hey, I am Margaret, a web developer who loves turning ideas into amazing websites!');
	const bannerImageHandler = useImageUpload({ initialImage: '/profile-bg.jpg' });
	const profileImageHandler = useImageUpload({ initialImage: '/avatar-72-01.jpg' });
	var fragment = $.comment();
	var node_6 = $.first_child(fragment);

	$.component(node_6, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_5();
				var node_7 = $.first_child(fragment_1);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						{
							let $0 = $.derived(() => buttonVariants({ variant: 'outline' }));

							Button($$anchor, $.spread_props(
								{
									variant: 'outline',
									get class() {
										return $.get($0);
									}
								},
								props,
								{
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Edit profile');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								}
							));
						}
					};

					$.component(node_7, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
						Dialog_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_8 = $.sibling(node_7, 2);

				$.component(node_8, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_6();
							var node_9 = $.first_child(fragment_3);

							$.component(node_9, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									class: 'contents space-y-0 text-left',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_10 = $.first_child(fragment_4);

										$.component(node_10, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												class: 'border-b px-6 py-4 text-base',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Edit profile');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var node_11 = $.sibling(node_9, 2);

							$.component(node_11, () => Dialog.Description, ($$anchor, Dialog_Description) => {
								Dialog_Description($$anchor, {
									class: 'sr-only',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Make changes to your profile here. You can change your photo and set a username.');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							var div_5 = $.sibling(node_11, 2);
							var node_12 = $.child(div_5);

							ProfileBg(node_12);

							var node_13 = $.sibling(node_12, 2);

							Avatar(node_13);

							var div_6 = $.sibling(node_13, 2);
							var form = $.child(div_6);
							var div_7 = $.child(form);
							var div_8 = $.child(div_7);
							var node_14 = $.child(div_8);

							Label(node_14, {
								get for() {
									return `${id}-first-name`;
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('First name');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_15 = $.sibling(node_14, 2);

							Input(node_15, {
								get id() {
									return `${id}-first-name`;
								},
								placeholder: 'Matt',
								defaultValue: 'Margaret',
								type: 'text',
								required: true
							});

							$.reset(div_8);

							var div_9 = $.sibling(div_8, 2);
							var node_16 = $.child(div_9);

							Label(node_16, {
								get for() {
									return `${id}-last-name`;
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Last name');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							var node_17 = $.sibling(node_16, 2);

							Input(node_17, {
								get id() {
									return `${id}-last-name`;
								},
								placeholder: 'Welsh',
								defaultValue: 'Villard',
								type: 'text',
								required: true
							});

							$.reset(div_9);
							$.reset(div_7);

							var div_10 = $.sibling(div_7, 2);
							var node_18 = $.child(div_10);

							Label(node_18, {
								get for() {
									return `${id}-username`;
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Username');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							var div_11 = $.sibling(node_18, 2);
							var node_19 = $.child(div_11);

							Input(node_19, {
								get id() {
									return `${id}-username`;
								},
								class: 'peer pe-9',
								placeholder: 'Username',
								defaultValue: 'margaret-villard-69',
								type: 'text',
								required: true
							});

							var div_12 = $.sibling(node_19, 2);
							var node_20 = $.child(div_12);

							Check(node_20, { size: 16, class: 'text-emerald-500', 'aria-hidden': 'true' });
							$.reset(div_12);
							$.reset(div_11);
							$.reset(div_10);

							var div_13 = $.sibling(div_10, 2);
							var node_21 = $.child(div_13);

							Label(node_21, {
								get for() {
									return `${id}-website`;
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Website');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});

							var div_14 = $.sibling(node_21, 2);
							var node_22 = $.sibling($.child(div_14), 2);

							Input(node_22, {
								get id() {
									return `${id}-website`;
								},
								class: '-ms-px rounded-s-none shadow-none',
								placeholder: 'yourwebsite.com',
								defaultValue: 'www.margaret.com',
								type: 'text'
							});

							$.reset(div_14);
							$.reset(div_13);

							var div_15 = $.sibling(div_13, 2);
							var node_23 = $.child(div_15);

							Label(node_23, {
								get for() {
									return `${id}-bio`;
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('Biography');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});

							var node_24 = $.sibling(node_23, 2);

							Textarea(node_24, {
								get id() {
									return `${id}-bio`;
								},

								get maxlength() {
									return bioLimit.maxLength;
								},
								placeholder: 'Write a few sentences about yourself',
								get 'aria-describedby'() {
									return `${id}-left-textarea`;
								},

								get value() {
									return bioLimit.value;
								},

								set value($$value) {
									bioLimit.value = $$value;
								}
							});

							var p = $.sibling(node_24, 2);
							var span = $.child(p);
							var text_8 = $.only_child(span, true);

							$.next();
							$.reset(p);
							$.reset(div_15);
							$.reset(form);
							$.reset(div_6);
							$.reset(div_5);

							var node_25 = $.sibling(div_5, 2);

							$.component(node_25, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									class: 'border-t px-6 py-4',
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_5();
										var node_26 = $.first_child(fragment_5);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;

												Button($$anchor, $.spread_props({ type: 'button', variant: 'outline' }, props, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_9 = $.text('Cancel');

														$.append($$anchor, text_9);
													},
													$$slots: { default: true }
												}));
											};

											$.component(node_26, () => Dialog.Close, ($$anchor, Dialog_Close) => {
												Dialog_Close($$anchor, { child, $$slots: { child: true } });
											});
										}

										var node_27 = $.sibling(node_26, 2);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;

												Button($$anchor, $.spread_props({ type: 'button' }, props, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_10 = $.text('Save changes');

														$.append($$anchor, text_10);
													},
													$$slots: { default: true }
												}));
											};

											$.component(node_27, () => Dialog.Close, ($$anchor, Dialog_Close_1) => {
												Dialog_Close_1($$anchor, { child, $$slots: { child: true } });
											});
										}

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							$.template_effect(() => {
								$.set_attribute(p, 'id', `${id}-left-textarea`);
								$.set_text(text_8, bioLimit.maxLength - bioLimit.characterCount);
							});

							$.append($$anchor, fragment_3);
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

$.delegate(['click']);