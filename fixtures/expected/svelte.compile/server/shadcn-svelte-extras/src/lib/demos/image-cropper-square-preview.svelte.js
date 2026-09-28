import * as $ from 'svelte/internal/server';
import * as ImageCropper from '$lib/components/ui/image-cropper';
import { toast } from 'svelte-sonner';

export default function Image_cropper_square_preview($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (ImageCropper.Root) {
			$$renderer.push('<!--[-->');

			ImageCropper.Root($$renderer, {
				src: 'https://github.com/shadcn.png',
				onUnsupportedFile: (file) => {
					toast.error(`Unsupported file type: ${file.type}`);
				},

				children: ($$renderer) => {
					if (ImageCropper.UploadTrigger) {
						$$renderer.push('<!--[-->');

						ImageCropper.UploadTrigger($$renderer, {
							children: ($$renderer) => {
								if (ImageCropper.Preview) {
									$$renderer.push('<!--[-->');
									ImageCropper.Preview($$renderer, { class: 'rounded-md' });
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

					if (ImageCropper.Dialog) {
						$$renderer.push('<!--[-->');

						ImageCropper.Dialog($$renderer, {
							children: ($$renderer) => {
								if (ImageCropper.Cropper) {
									$$renderer.push('<!--[-->');
									ImageCropper.Cropper($$renderer, { cropShape: 'rect' });
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
	});
}