import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-wrap items-center gap-2"><!> <!> <!></div> <div class="flex flex-wrap items-center gap-2"><!> <!> <!></div>`, 1);

export default function Avatar_with_badge($$anchor) {
	Example($$anchor, {
		title: 'Badge',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			$.component(node, () => Avatar.Root, ($$anchor, Avatar_Root) => {
				Avatar_Root($$anchor, {
					size: 'sm',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Avatar.Image, ($$anchor, Avatar_Image) => {
							Avatar_Image($$anchor, { src: 'https://github.com/jorgezreik.png', alt: '@jorgezreik' });
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
							Avatar_Fallback($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('JZ');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Avatar.Badge, ($$anchor, Avatar_Badge) => {
							Avatar_Badge($$anchor, {});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_4 = $.sibling(node, 2);

			$.component(node_4, () => Avatar.Root, ($$anchor, Avatar_Root_1) => {
				Avatar_Root_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_5 = $.first_child(fragment_3);

						$.component(node_5, () => Avatar.Image, ($$anchor, Avatar_Image_1) => {
							Avatar_Image_1($$anchor, { src: 'https://github.com/jorgezreik.png', alt: '@jorgezreik' });
						});

						var node_6 = $.sibling(node_5, 2);

						$.component(node_6, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_1) => {
							Avatar_Fallback_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('JZ');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						var node_7 = $.sibling(node_6, 2);

						$.component(node_7, () => Avatar.Badge, ($$anchor, Avatar_Badge_1) => {
							Avatar_Badge_1($$anchor, {});
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			var node_8 = $.sibling(node_4, 2);

			$.component(node_8, () => Avatar.Root, ($$anchor, Avatar_Root_2) => {
				Avatar_Root_2($$anchor, {
					size: 'lg',
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root();
						var node_9 = $.first_child(fragment_4);

						$.component(node_9, () => Avatar.Image, ($$anchor, Avatar_Image_2) => {
							Avatar_Image_2($$anchor, { src: 'https://github.com/jorgezreik.png', alt: '@jorgezreik' });
						});

						var node_10 = $.sibling(node_9, 2);

						$.component(node_10, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_2) => {
							Avatar_Fallback_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('JZ');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						});

						var node_11 = $.sibling(node_10, 2);

						$.component(node_11, () => Avatar.Badge, ($$anchor, Avatar_Badge_2) => {
							Avatar_Badge_2($$anchor, {});
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var node_12 = $.child(div_1);

			$.component(node_12, () => Avatar.Root, ($$anchor, Avatar_Root_3) => {
				Avatar_Root_3($$anchor, {
					size: 'sm',
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root_1();
						var node_13 = $.first_child(fragment_5);

						$.component(node_13, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_3) => {
							Avatar_Fallback_3($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('JZ');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						});

						var node_14 = $.sibling(node_13, 2);

						$.component(node_14, () => Avatar.Badge, ($$anchor, Avatar_Badge_3) => {
							Avatar_Badge_3($$anchor, {});
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			});

			var node_15 = $.sibling(node_12, 2);

			$.component(node_15, () => Avatar.Root, ($$anchor, Avatar_Root_4) => {
				Avatar_Root_4($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_6 = root_1();
						var node_16 = $.first_child(fragment_6);

						$.component(node_16, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_4) => {
							Avatar_Fallback_4($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('JZ');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						});

						var node_17 = $.sibling(node_16, 2);

						$.component(node_17, () => Avatar.Badge, ($$anchor, Avatar_Badge_4) => {
							Avatar_Badge_4($$anchor, {});
						});

						$.append($$anchor, fragment_6);
					},
					$$slots: { default: true }
				});
			});

			var node_18 = $.sibling(node_15, 2);

			$.component(node_18, () => Avatar.Root, ($$anchor, Avatar_Root_5) => {
				Avatar_Root_5($$anchor, {
					size: 'lg',
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root_1();
						var node_19 = $.first_child(fragment_7);

						$.component(node_19, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_5) => {
							Avatar_Fallback_5($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('JZ');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});
						});

						var node_20 = $.sibling(node_19, 2);

						$.component(node_20, () => Avatar.Badge, ($$anchor, Avatar_Badge_5) => {
							Avatar_Badge_5($$anchor, {});
						});

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_1);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}