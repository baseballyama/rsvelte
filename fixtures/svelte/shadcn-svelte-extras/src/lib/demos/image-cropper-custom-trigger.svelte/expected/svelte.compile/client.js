import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ImageCropper from '$lib/components/ui/image-cropper';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import Button from '$lib/components/button.svelte';
import EditIcon from '@lucide/svelte/icons/edit';
import { toast } from 'svelte-sonner';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="relative"><!> <!></div> <!>`, 1);

export default function Image_cropper_custom_trigger($$anchor, $$props) {
	$.push($$props, true);

	let src = $.state('https://github.com/shadcn.png');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => ImageCropper.Root, ($$anchor, ImageCropper_Root) => {
		ImageCropper_Root($$anchor, {
			onUnsupportedFile: (file) => {
				toast.error(`Unsupported file type: ${file.type}`);
			},

			get src() {
				return $.get(src);
			},

			set src($$value) {
				$.set(src, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var div = $.first_child(fragment_1);
				var node_1 = $.child(div);

				$.component(node_1, () => ImageCropper.Preview, ($$anchor, ImageCropper_Preview) => {
					ImageCropper_Preview($$anchor, {});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
					DropdownMenu_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_3 = $.first_child(fragment_2);

							{
								const child = ($$anchor, $$arg0) => {
									let props = () => ($$arg0?.()).props;

									Button($$anchor, $.spread_props(props, {
										class: 'absolute -bottom-3 -left-3 rounded-full',
										variant: 'outline',
										size: 'icon',
										children: ($$anchor, $$slotProps) => {
											EditIcon($$anchor, { class: 'size-4' });
										},
										$$slots: { default: true }
									}));
								};

								$.component(node_3, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
									DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
								});
							}

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
								DropdownMenu_Content($$anchor, {
									align: 'start',
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root();
										var node_5 = $.first_child(fragment_5);

										$.component(node_5, () => ImageCropper.UploadTrigger, ($$anchor, ImageCropper_UploadTrigger) => {
											ImageCropper_UploadTrigger($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_6 = $.first_child(fragment_6);

													$.component(node_6, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
														DropdownMenu_Item($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text('Upload a photo...');

																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_5, 2);

										$.component(node_7, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
											DropdownMenu_Item_1($$anchor, {
												onclick: () => $.set(src, ''),
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Remove photo');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div);

				var node_8 = $.sibling(div, 2);

				$.component(node_8, () => ImageCropper.Dialog, ($$anchor, ImageCropper_Dialog) => {
					ImageCropper_Dialog($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root();
							var node_9 = $.first_child(fragment_7);

							$.component(node_9, () => ImageCropper.Cropper, ($$anchor, ImageCropper_Cropper) => {
								ImageCropper_Cropper($$anchor, {});
							});

							var node_10 = $.sibling(node_9, 2);

							$.component(node_10, () => ImageCropper.Controls, ($$anchor, ImageCropper_Controls) => {
								ImageCropper_Controls($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = root();
										var node_11 = $.first_child(fragment_8);

										$.component(node_11, () => ImageCropper.Cancel, ($$anchor, ImageCropper_Cancel) => {
											ImageCropper_Cancel($$anchor, {});
										});

										var node_12 = $.sibling(node_11, 2);

										$.component(node_12, () => ImageCropper.Crop, ($$anchor, ImageCropper_Crop) => {
											ImageCropper_Crop($$anchor, {});
										});

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_7);
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