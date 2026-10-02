import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Avatar from "$lib/registry/ui/avatar/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-row flex-wrap items-center gap-12"><!> <!> <div class="flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:grayscale"><!> <!> <!></div></div>`);

export default function Avatar_demo($$anchor) {
	var div = root_1();
	var node = $.child(div);

	$.component(node, () => Avatar.Root, ($$anchor, Avatar_Root) => {
		Avatar_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Avatar.Image, ($$anchor, Avatar_Image) => {
					Avatar_Image($$anchor, { src: 'https://github.com/shadcn.png', alt: '@shadcn' });
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
					Avatar_Fallback($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('CN');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_3 = $.sibling(node, 2);

	$.component(node_3, () => Avatar.Root, ($$anchor, Avatar_Root_1) => {
		Avatar_Root_1($$anchor, {
			class: 'rounded-lg',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_4 = $.first_child(fragment_1);

				$.component(node_4, () => Avatar.Image, ($$anchor, Avatar_Image_1) => {
					Avatar_Image_1($$anchor, { src: 'https://github.com/evilrabbit.png', alt: '@evilrabbit' });
				});

				var node_5 = $.sibling(node_4, 2);

				$.component(node_5, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_1) => {
					Avatar_Fallback_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('ER');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var div_1 = $.sibling(node_3, 2);
	var node_6 = $.child(div_1);

	$.component(node_6, () => Avatar.Root, ($$anchor, Avatar_Root_2) => {
		Avatar_Root_2($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_7 = $.first_child(fragment_2);

				$.component(node_7, () => Avatar.Image, ($$anchor, Avatar_Image_2) => {
					Avatar_Image_2($$anchor, { src: 'https://github.com/shadcn.png', alt: '@shadcn' });
				});

				var node_8 = $.sibling(node_7, 2);

				$.component(node_8, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_2) => {
					Avatar_Fallback_2($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('CN');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	var node_9 = $.sibling(node_6, 2);

	$.component(node_9, () => Avatar.Root, ($$anchor, Avatar_Root_3) => {
		Avatar_Root_3($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root();
				var node_10 = $.first_child(fragment_3);

				$.component(node_10, () => Avatar.Image, ($$anchor, Avatar_Image_3) => {
					Avatar_Image_3($$anchor, { src: 'https://github.com/leerob.png', alt: '@leerob' });
				});

				var node_11 = $.sibling(node_10, 2);

				$.component(node_11, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_3) => {
					Avatar_Fallback_3($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('LR');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	});

	var node_12 = $.sibling(node_9, 2);

	$.component(node_12, () => Avatar.Root, ($$anchor, Avatar_Root_4) => {
		Avatar_Root_4($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root();
				var node_13 = $.first_child(fragment_4);

				$.component(node_13, () => Avatar.Image, ($$anchor, Avatar_Image_4) => {
					Avatar_Image_4($$anchor, { src: 'https://github.com/evilrabbit.png', alt: '@evilrabbit' });
				});

				var node_14 = $.sibling(node_13, 2);

				$.component(node_14, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_4) => {
					Avatar_Fallback_4($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('ER');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}