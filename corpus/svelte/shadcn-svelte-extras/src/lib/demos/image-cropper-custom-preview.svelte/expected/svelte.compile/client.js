import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ImageCropper from '$lib/components/ui/image-cropper';
import { toast } from 'svelte-sonner';

var root = $.from_html(`<img alt="your avatar" class="size-32 border-2 border-blue-500"/>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Image_cropper_custom_preview($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => ImageCropper.Root, ($$anchor, ImageCropper_Root) => {
		ImageCropper_Root($$anchor, {
			src: 'https://github.com/shadcn.png',
			onUnsupportedFile: (file) => {
				toast.error(`Unsupported file type: ${file.type}`);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => ImageCropper.UploadTrigger, ($$anchor, ImageCropper_UploadTrigger) => {
					ImageCropper_UploadTrigger($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							{
								const child = ($$anchor, $$arg0) => {
									let src = () => ($$arg0?.()).src;
									var img = root();

									$.template_effect(() => $.set_attribute(img, 'src', src()));
									$.append($$anchor, img);
								};

								$.component(node_2, () => ImageCropper.Preview, ($$anchor, ImageCropper_Preview) => {
									ImageCropper_Preview($$anchor, { child, $$slots: { child: true } });
								});
							}

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => ImageCropper.Dialog, ($$anchor, ImageCropper_Dialog) => {
					ImageCropper_Dialog($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_4 = $.first_child(fragment_3);

							$.component(node_4, () => ImageCropper.Cropper, ($$anchor, ImageCropper_Cropper) => {
								ImageCropper_Cropper($$anchor, { cropShape: 'rect' });
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => ImageCropper.Controls, ($$anchor, ImageCropper_Controls) => {
								ImageCropper_Controls($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => ImageCropper.Cancel, ($$anchor, ImageCropper_Cancel) => {
											ImageCropper_Cancel($$anchor, {});
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => ImageCropper.Crop, ($$anchor, ImageCropper_Crop) => {
											ImageCropper_Crop($$anchor, {});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
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