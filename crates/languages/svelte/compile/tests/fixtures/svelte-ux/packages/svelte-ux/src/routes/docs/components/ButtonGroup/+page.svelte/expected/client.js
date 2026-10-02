import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	mdiChevronDown,
	mdiFormatAlignLeft,
	mdiFormatAlignCenter,
	mdiFormatAlignRight,
	mdiBookmark
} from '@mdi/js';

import { Button, ButtonGroup, Menu, MenuItem, Toggle, Tooltip } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid gap-2"><!> <!> <!> <!> <!></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<span><!> <!></span>`);
var root_5 = $.from_html(`<h1>Examples</h1> <h2>Basic</h2> <!> <h2>Icons</h2> <!> <h2>Icons (partially rounded)</h2> <!> <h2>Selected</h2> <!> <h2>Size</h2> <!> <h2>Disabled</h2> <!> <h2>with Menu</h2> <!> <h2>with Tooltip</h2> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root_5();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var node_1 = $.child(div);

			ButtonGroup(node_1, {
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_2 = $.first_child(fragment_1);

					Button(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Left');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Button(node_3, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Center');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					Button(node_4, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Right');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_1, 2);

			ButtonGroup(node_5, {
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_6 = $.first_child(fragment_2);

					Button(node_6, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Left');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					Button(node_7, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Center');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					Button(node_8, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Right');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_5, 2);

			ButtonGroup(node_9, {
				variant: 'fill',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_10 = $.first_child(fragment_3);

					Button(node_10, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Left');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_10, 2);

					Button(node_11, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Center');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_11, 2);

					Button(node_12, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Right');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_13 = $.sibling(node_9, 2);

			ButtonGroup(node_13, {
				variant: 'fill-light',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_14 = $.first_child(fragment_4);

					Button(node_14, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('Left');

							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});

					var node_15 = $.sibling(node_14, 2);

					Button(node_15, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text('Center');

							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});

					var node_16 = $.sibling(node_15, 2);

					Button(node_16, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_11 = $.text('Right');

							$.append($$anchor, text_11);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_17 = $.sibling(node_13, 2);

			ButtonGroup(node_17, {
				variant: 'fill-outline',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root();
					var node_18 = $.first_child(fragment_5);

					Button(node_18, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_12 = $.text('Left');

							$.append($$anchor, text_12);
						},
						$$slots: { default: true }
					});

					var node_19 = $.sibling(node_18, 2);

					Button(node_19, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_13 = $.text('Center');

							$.append($$anchor, text_13);
						},
						$$slots: { default: true }
					});

					var node_20 = $.sibling(node_19, 2);

					Button(node_20, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_14 = $.text('Right');

							$.append($$anchor, text_14);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_21 = $.sibling(node, 4);

	Preview(node_21, {
		children: ($$anchor, $$slotProps) => {
			var div_1 = root_1();
			var node_22 = $.child(div_1);

			ButtonGroup(node_22, {
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root();
					var node_23 = $.first_child(fragment_6);

					Button(node_23, {
						get icon() {
							return mdiFormatAlignLeft;
						}
					});

					var node_24 = $.sibling(node_23, 2);

					Button(node_24, {
						get icon() {
							return mdiFormatAlignCenter;
						}
					});

					var node_25 = $.sibling(node_24, 2);

					Button(node_25, {
						get icon() {
							return mdiFormatAlignRight;
						}
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			var node_26 = $.sibling(node_22, 2);

			ButtonGroup(node_26, {
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root();
					var node_27 = $.first_child(fragment_7);

					Button(node_27, {
						get icon() {
							return mdiFormatAlignLeft;
						}
					});

					var node_28 = $.sibling(node_27, 2);

					Button(node_28, {
						get icon() {
							return mdiFormatAlignCenter;
						}
					});

					var node_29 = $.sibling(node_28, 2);

					Button(node_29, {
						get icon() {
							return mdiFormatAlignRight;
						}
					});

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			var node_30 = $.sibling(node_26, 2);

			ButtonGroup(node_30, {
				variant: 'fill',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_8 = root();
					var node_31 = $.first_child(fragment_8);

					Button(node_31, {
						get icon() {
							return mdiFormatAlignLeft;
						}
					});

					var node_32 = $.sibling(node_31, 2);

					Button(node_32, {
						get icon() {
							return mdiFormatAlignCenter;
						}
					});

					var node_33 = $.sibling(node_32, 2);

					Button(node_33, {
						get icon() {
							return mdiFormatAlignRight;
						}
					});

					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});

			var node_34 = $.sibling(node_30, 2);

			ButtonGroup(node_34, {
				variant: 'fill-light',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_9 = root();
					var node_35 = $.first_child(fragment_9);

					Button(node_35, {
						get icon() {
							return mdiFormatAlignLeft;
						}
					});

					var node_36 = $.sibling(node_35, 2);

					Button(node_36, {
						get icon() {
							return mdiFormatAlignCenter;
						}
					});

					var node_37 = $.sibling(node_36, 2);

					Button(node_37, {
						get icon() {
							return mdiFormatAlignRight;
						}
					});

					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});

			var node_38 = $.sibling(node_34, 2);

			ButtonGroup(node_38, {
				variant: 'fill-outline',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root();
					var node_39 = $.first_child(fragment_10);

					Button(node_39, {
						get icon() {
							return mdiFormatAlignLeft;
						}
					});

					var node_40 = $.sibling(node_39, 2);

					Button(node_40, {
						get icon() {
							return mdiFormatAlignCenter;
						}
					});

					var node_41 = $.sibling(node_40, 2);

					Button(node_41, {
						get icon() {
							return mdiFormatAlignRight;
						}
					});

					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_42 = $.sibling(node_21, 4);

	Preview(node_42, {
		children: ($$anchor, $$slotProps) => {
			var div_2 = root_1();
			var node_43 = $.child(div_2);

			ButtonGroup(node_43, {
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_11 = root();
					var node_44 = $.first_child(fragment_11);

					Button(node_44, {
						get icon() {
							return mdiFormatAlignLeft;
						},
						iconOnly: false
					});

					var node_45 = $.sibling(node_44, 2);

					Button(node_45, {
						get icon() {
							return mdiFormatAlignCenter;
						},
						iconOnly: false
					});

					var node_46 = $.sibling(node_45, 2);

					Button(node_46, {
						get icon() {
							return mdiFormatAlignRight;
						},
						iconOnly: false
					});

					$.append($$anchor, fragment_11);
				},
				$$slots: { default: true }
			});

			var node_47 = $.sibling(node_43, 2);

			ButtonGroup(node_47, {
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					var fragment_12 = root();
					var node_48 = $.first_child(fragment_12);

					Button(node_48, {
						get icon() {
							return mdiFormatAlignLeft;
						},
						iconOnly: false
					});

					var node_49 = $.sibling(node_48, 2);

					Button(node_49, {
						get icon() {
							return mdiFormatAlignCenter;
						},
						iconOnly: false
					});

					var node_50 = $.sibling(node_49, 2);

					Button(node_50, {
						get icon() {
							return mdiFormatAlignRight;
						},
						iconOnly: false
					});

					$.append($$anchor, fragment_12);
				},
				$$slots: { default: true }
			});

			var node_51 = $.sibling(node_47, 2);

			ButtonGroup(node_51, {
				variant: 'fill',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_13 = root();
					var node_52 = $.first_child(fragment_13);

					Button(node_52, {
						get icon() {
							return mdiFormatAlignLeft;
						},
						iconOnly: false
					});

					var node_53 = $.sibling(node_52, 2);

					Button(node_53, {
						get icon() {
							return mdiFormatAlignCenter;
						},
						iconOnly: false
					});

					var node_54 = $.sibling(node_53, 2);

					Button(node_54, {
						get icon() {
							return mdiFormatAlignRight;
						},
						iconOnly: false
					});

					$.append($$anchor, fragment_13);
				},
				$$slots: { default: true }
			});

			var node_55 = $.sibling(node_51, 2);

			ButtonGroup(node_55, {
				variant: 'fill-light',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_14 = root();
					var node_56 = $.first_child(fragment_14);

					Button(node_56, {
						get icon() {
							return mdiFormatAlignLeft;
						},
						iconOnly: false
					});

					var node_57 = $.sibling(node_56, 2);

					Button(node_57, {
						get icon() {
							return mdiFormatAlignCenter;
						},
						iconOnly: false
					});

					var node_58 = $.sibling(node_57, 2);

					Button(node_58, {
						get icon() {
							return mdiFormatAlignRight;
						},
						iconOnly: false
					});

					$.append($$anchor, fragment_14);
				},
				$$slots: { default: true }
			});

			var node_59 = $.sibling(node_55, 2);

			ButtonGroup(node_59, {
				variant: 'fill-outline',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_15 = root();
					var node_60 = $.first_child(fragment_15);

					Button(node_60, {
						get icon() {
							return mdiFormatAlignLeft;
						},
						iconOnly: false
					});

					var node_61 = $.sibling(node_60, 2);

					Button(node_61, {
						get icon() {
							return mdiFormatAlignCenter;
						},
						iconOnly: false
					});

					var node_62 = $.sibling(node_61, 2);

					Button(node_62, {
						get icon() {
							return mdiFormatAlignRight;
						},
						iconOnly: false
					});

					$.append($$anchor, fragment_15);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	var node_63 = $.sibling(node_42, 4);

	Preview(node_63, {
		children: ($$anchor, $$slotProps) => {
			var div_3 = root_1();
			var node_64 = $.child(div_3);

			ButtonGroup(node_64, {
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_16 = root();
					var node_65 = $.first_child(fragment_16);

					Button(node_65, {
						get icon() {
							return mdiFormatAlignLeft;
						},
						iconOnly: false,
						variant: 'fill-light'
					});

					var node_66 = $.sibling(node_65, 2);

					Button(node_66, {
						get icon() {
							return mdiFormatAlignCenter;
						},
						iconOnly: false
					});

					var node_67 = $.sibling(node_66, 2);

					Button(node_67, {
						get icon() {
							return mdiFormatAlignRight;
						},
						iconOnly: false
					});

					$.append($$anchor, fragment_16);
				},
				$$slots: { default: true }
			});

			var node_68 = $.sibling(node_64, 2);

			ButtonGroup(node_68, {
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					var fragment_17 = root();
					var node_69 = $.first_child(fragment_17);

					Button(node_69, {
						get icon() {
							return mdiFormatAlignLeft;
						},
						iconOnly: false
					});

					var node_70 = $.sibling(node_69, 2);

					Button(node_70, {
						get icon() {
							return mdiFormatAlignCenter;
						},
						iconOnly: false,
						variant: 'fill-outline',
						color: 'primary',
						class: 'z-10'
					});

					var node_71 = $.sibling(node_70, 2);

					Button(node_71, {
						get icon() {
							return mdiFormatAlignRight;
						},
						iconOnly: false
					});

					$.append($$anchor, fragment_17);
				},
				$$slots: { default: true }
			});

			var node_72 = $.sibling(node_68, 2);

			ButtonGroup(node_72, {
				variant: 'fill',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_18 = root();
					var node_73 = $.first_child(fragment_18);

					Button(node_73, {
						get icon() {
							return mdiFormatAlignLeft;
						},
						iconOnly: false
					});

					var node_74 = $.sibling(node_73, 2);

					Button(node_74, {
						get icon() {
							return mdiFormatAlignCenter;
						},
						iconOnly: false
					});

					var node_75 = $.sibling(node_74, 2);

					Button(node_75, {
						get icon() {
							return mdiFormatAlignRight;
						},
						iconOnly: false,
						class: 'bg-primary-700 hover:bg-primary-900'
					});

					$.append($$anchor, fragment_18);
				},
				$$slots: { default: true }
			});

			var node_76 = $.sibling(node_72, 2);

			ButtonGroup(node_76, {
				variant: 'fill-light',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_19 = root();
					var node_77 = $.first_child(fragment_19);

					Button(node_77, {
						get icon() {
							return mdiFormatAlignLeft;
						},
						iconOnly: false
					});

					var node_78 = $.sibling(node_77, 2);

					Button(node_78, {
						get icon() {
							return mdiFormatAlignCenter;
						},
						iconOnly: false,
						variant: 'fill'
					});

					var node_79 = $.sibling(node_78, 2);

					Button(node_79, {
						get icon() {
							return mdiFormatAlignRight;
						},
						iconOnly: false
					});

					$.append($$anchor, fragment_19);
				},
				$$slots: { default: true }
			});

			var node_80 = $.sibling(node_76, 2);

			ButtonGroup(node_80, {
				variant: 'fill-outline',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_20 = root();
					var node_81 = $.first_child(fragment_20);

					Button(node_81, {
						get icon() {
							return mdiFormatAlignLeft;
						},
						iconOnly: false,
						variant: 'fill'
					});

					var node_82 = $.sibling(node_81, 2);

					Button(node_82, {
						get icon() {
							return mdiFormatAlignCenter;
						},
						iconOnly: false
					});

					var node_83 = $.sibling(node_82, 2);

					Button(node_83, {
						get icon() {
							return mdiFormatAlignRight;
						},
						iconOnly: false
					});

					$.append($$anchor, fragment_20);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.append($$anchor, div_3);
		},
		$$slots: { default: true }
	});

	var node_84 = $.sibling(node_63, 4);

	Preview(node_84, {
		children: ($$anchor, $$slotProps) => {
			var div_4 = root_1();
			var node_85 = $.child(div_4);

			ButtonGroup(node_85, {
				size: 'sm',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_21 = root_2();
					var node_86 = $.first_child(fragment_21);

					Button(node_86, {
						get icon() {
							return mdiBookmark;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_15 = $.text('Bookmark');

							$.append($$anchor, text_15);
						},
						$$slots: { default: true }
					});

					var node_87 = $.sibling(node_86, 2);

					Button(node_87, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_16 = $.text('12k');

							$.append($$anchor, text_16);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_21);
				},
				$$slots: { default: true }
			});

			var node_88 = $.sibling(node_85, 2);

			ButtonGroup(node_88, {
				variant: 'outline',
				size: 'sm',
				children: ($$anchor, $$slotProps) => {
					var fragment_22 = root_2();
					var node_89 = $.first_child(fragment_22);

					Button(node_89, {
						get icon() {
							return mdiBookmark;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_17 = $.text('Bookmark');

							$.append($$anchor, text_17);
						},
						$$slots: { default: true }
					});

					var node_90 = $.sibling(node_89, 2);

					Button(node_90, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_18 = $.text('12k');

							$.append($$anchor, text_18);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_22);
				},
				$$slots: { default: true }
			});

			var node_91 = $.sibling(node_88, 2);

			ButtonGroup(node_91, {
				variant: 'fill',
				size: 'sm',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_23 = root_2();
					var node_92 = $.first_child(fragment_23);

					Button(node_92, {
						get icon() {
							return mdiBookmark;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_19 = $.text('Bookmark');

							$.append($$anchor, text_19);
						},
						$$slots: { default: true }
					});

					var node_93 = $.sibling(node_92, 2);

					Button(node_93, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_20 = $.text('12k');

							$.append($$anchor, text_20);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_23);
				},
				$$slots: { default: true }
			});

			var node_94 = $.sibling(node_91, 2);

			ButtonGroup(node_94, {
				variant: 'fill-light',
				size: 'sm',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_24 = root_2();
					var node_95 = $.first_child(fragment_24);

					Button(node_95, {
						get icon() {
							return mdiBookmark;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_21 = $.text('Bookmark');

							$.append($$anchor, text_21);
						},
						$$slots: { default: true }
					});

					var node_96 = $.sibling(node_95, 2);

					Button(node_96, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_22 = $.text('12k');

							$.append($$anchor, text_22);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_24);
				},
				$$slots: { default: true }
			});

			var node_97 = $.sibling(node_94, 2);

			ButtonGroup(node_97, {
				variant: 'fill-outline',
				size: 'sm',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_25 = root_2();
					var node_98 = $.first_child(fragment_25);

					Button(node_98, {
						get icon() {
							return mdiBookmark;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_23 = $.text('Bookmark');

							$.append($$anchor, text_23);
						},
						$$slots: { default: true }
					});

					var node_99 = $.sibling(node_98, 2);

					Button(node_99, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_24 = $.text('12k');

							$.append($$anchor, text_24);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_25);
				},
				$$slots: { default: true }
			});

			$.reset(div_4);
			$.append($$anchor, div_4);
		},
		$$slots: { default: true }
	});

	var node_100 = $.sibling(node_84, 4);

	Preview(node_100, {
		children: ($$anchor, $$slotProps) => {
			var div_5 = root_1();
			var node_101 = $.child(div_5);

			ButtonGroup(node_101, {
				color: 'primary',
				disabled: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_26 = root();
					var node_102 = $.first_child(fragment_26);

					Button(node_102, {
						get icon() {
							return mdiFormatAlignLeft;
						},
						iconOnly: false
					});

					var node_103 = $.sibling(node_102, 2);

					Button(node_103, {
						get icon() {
							return mdiFormatAlignCenter;
						},
						iconOnly: false
					});

					var node_104 = $.sibling(node_103, 2);

					Button(node_104, {
						get icon() {
							return mdiFormatAlignRight;
						},
						iconOnly: false
					});

					$.append($$anchor, fragment_26);
				},
				$$slots: { default: true }
			});

			var node_105 = $.sibling(node_101, 2);

			ButtonGroup(node_105, {
				variant: 'outline',
				disabled: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_27 = root();
					var node_106 = $.first_child(fragment_27);

					Button(node_106, {
						get icon() {
							return mdiFormatAlignLeft;
						},
						iconOnly: false
					});

					var node_107 = $.sibling(node_106, 2);

					Button(node_107, {
						get icon() {
							return mdiFormatAlignCenter;
						},
						iconOnly: false
					});

					var node_108 = $.sibling(node_107, 2);

					Button(node_108, {
						get icon() {
							return mdiFormatAlignRight;
						},
						iconOnly: false
					});

					$.append($$anchor, fragment_27);
				},
				$$slots: { default: true }
			});

			var node_109 = $.sibling(node_105, 2);

			ButtonGroup(node_109, {
				variant: 'fill',
				disabled: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_28 = root();
					var node_110 = $.first_child(fragment_28);

					Button(node_110, {
						color: 'primary',
						get icon() {
							return mdiFormatAlignLeft;
						},
						iconOnly: false
					});

					var node_111 = $.sibling(node_110, 2);

					Button(node_111, {
						color: 'primary',
						get icon() {
							return mdiFormatAlignCenter;
						},
						iconOnly: false
					});

					var node_112 = $.sibling(node_111, 2);

					Button(node_112, {
						color: 'primary',
						get icon() {
							return mdiFormatAlignRight;
						},
						iconOnly: false
					});

					$.append($$anchor, fragment_28);
				},
				$$slots: { default: true }
			});

			var node_113 = $.sibling(node_109, 2);

			ButtonGroup(node_113, {
				variant: 'fill-light',
				disabled: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_29 = root();
					var node_114 = $.first_child(fragment_29);

					Button(node_114, {
						color: 'primary',
						get icon() {
							return mdiFormatAlignLeft;
						},
						iconOnly: false
					});

					var node_115 = $.sibling(node_114, 2);

					Button(node_115, {
						color: 'primary',
						get icon() {
							return mdiFormatAlignCenter;
						},
						iconOnly: false
					});

					var node_116 = $.sibling(node_115, 2);

					Button(node_116, {
						color: 'primary',
						get icon() {
							return mdiFormatAlignRight;
						},
						iconOnly: false
					});

					$.append($$anchor, fragment_29);
				},
				$$slots: { default: true }
			});

			var node_117 = $.sibling(node_113, 2);

			ButtonGroup(node_117, {
				variant: 'fill-outline',
				disabled: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_30 = root();
					var node_118 = $.first_child(fragment_30);

					Button(node_118, {
						color: 'primary',
						get icon() {
							return mdiFormatAlignLeft;
						},
						iconOnly: false
					});

					var node_119 = $.sibling(node_118, 2);

					Button(node_119, {
						color: 'primary',
						get icon() {
							return mdiFormatAlignCenter;
						},
						iconOnly: false
					});

					var node_120 = $.sibling(node_119, 2);

					Button(node_120, {
						color: 'primary',
						get icon() {
							return mdiFormatAlignRight;
						},
						iconOnly: false
					});

					$.append($$anchor, fragment_30);
				},
				$$slots: { default: true }
			});

			$.reset(div_5);
			$.append($$anchor, div_5);
		},
		$$slots: { default: true }
	});

	var node_121 = $.sibling(node_100, 4);

	Preview(node_121, {
		children: ($$anchor, $$slotProps) => {
			var div_6 = root_1();
			var node_122 = $.child(div_6);

			ButtonGroup(node_122, {
				children: ($$anchor, $$slotProps) => {
					var fragment_31 = root_2();
					var node_123 = $.first_child(fragment_31);

					Button(node_123, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_25 = $.text('Click me');

							$.append($$anchor, text_25);
						},
						$$slots: { default: true }
					});

					var node_124 = $.sibling(node_123, 2);

					Toggle(node_124, {
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$anchor, $$slotProps) => {
								const open = $.derived(() => $$slotProps.on);
								const toggle = $.derived(() => $$slotProps.toggle);
								const toggleOff = $.derived(() => $$slotProps.toggleOff);
								var span = root_4();
								var node_125 = $.child(span);

								Button(node_125, {
									get icon() {
										return mdiChevronDown;
									},
									rounded: true,
									class: 'px-1',
									$$events: {
										click: function (...$$args) {
											$.get(toggle)?.apply(this, $$args);
										}
									}
								});

								var node_126 = $.sibling(node_125, 2);

								Menu(node_126, {
									get open() {
										return $.get(open);
									},
									placement: 'bottom-start',
									$$events: {
										close: function (...$$args) {
											$.get(toggleOff)?.apply(this, $$args);
										}
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_32 = root_3();
										var node_127 = $.first_child(fragment_32);

										MenuItem(node_127, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_26 = $.text('Hello');

												$.append($$anchor, text_26);
											},
											$$slots: { default: true }
										});

										var node_128 = $.sibling(node_127, 2);

										MenuItem(node_128, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_27 = $.text('Hello');

												$.append($$anchor, text_27);
											},
											$$slots: { default: true }
										});

										var node_129 = $.sibling(node_128, 2);

										MenuItem(node_129, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_28 = $.text('Hello');

												$.append($$anchor, text_28);
											},
											$$slots: { default: true }
										});

										var node_130 = $.sibling(node_129, 2);

										MenuItem(node_130, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_29 = $.text('Hello');

												$.append($$anchor, text_29);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_32);
									},
									$$slots: { default: true }
								});

								$.reset(span);
								$.append($$anchor, span);
							}
						}
					});

					$.append($$anchor, fragment_31);
				},
				$$slots: { default: true }
			});

			var node_131 = $.sibling(node_122, 2);

			ButtonGroup(node_131, {
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					var fragment_33 = root_2();
					var node_132 = $.first_child(fragment_33);

					Button(node_132, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_30 = $.text('Click me');

							$.append($$anchor, text_30);
						},
						$$slots: { default: true }
					});

					var node_133 = $.sibling(node_132, 2);

					Toggle(node_133, {
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$anchor, $$slotProps) => {
								const open = $.derived(() => $$slotProps.on);
								const toggle = $.derived(() => $$slotProps.toggle);
								const toggleOff = $.derived(() => $$slotProps.toggleOff);
								var span_1 = root_4();
								var node_134 = $.child(span_1);

								Button(node_134, {
									get icon() {
										return mdiChevronDown;
									},
									rounded: true,
									class: 'px-1',
									$$events: {
										click: function (...$$args) {
											$.get(toggle)?.apply(this, $$args);
										}
									}
								});

								var node_135 = $.sibling(node_134, 2);

								Menu(node_135, {
									get open() {
										return $.get(open);
									},
									placement: 'bottom-start',
									$$events: {
										close: function (...$$args) {
											$.get(toggleOff)?.apply(this, $$args);
										}
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_34 = root_3();
										var node_136 = $.first_child(fragment_34);

										MenuItem(node_136, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_31 = $.text('Hello');

												$.append($$anchor, text_31);
											},
											$$slots: { default: true }
										});

										var node_137 = $.sibling(node_136, 2);

										MenuItem(node_137, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_32 = $.text('Hello');

												$.append($$anchor, text_32);
											},
											$$slots: { default: true }
										});

										var node_138 = $.sibling(node_137, 2);

										MenuItem(node_138, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_33 = $.text('Hello');

												$.append($$anchor, text_33);
											},
											$$slots: { default: true }
										});

										var node_139 = $.sibling(node_138, 2);

										MenuItem(node_139, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_34 = $.text('Hello');

												$.append($$anchor, text_34);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_34);
									},
									$$slots: { default: true }
								});

								$.reset(span_1);
								$.append($$anchor, span_1);
							}
						}
					});

					$.append($$anchor, fragment_33);
				},
				$$slots: { default: true }
			});

			var node_140 = $.sibling(node_131, 2);

			ButtonGroup(node_140, {
				variant: 'fill',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_35 = root_2();
					var node_141 = $.first_child(fragment_35);

					Button(node_141, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_35 = $.text('Click me');

							$.append($$anchor, text_35);
						},
						$$slots: { default: true }
					});

					var node_142 = $.sibling(node_141, 2);

					Toggle(node_142, {
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$anchor, $$slotProps) => {
								const open = $.derived(() => $$slotProps.on);
								const toggle = $.derived(() => $$slotProps.toggle);
								const toggleOff = $.derived(() => $$slotProps.toggleOff);
								var span_2 = root_4();
								var node_143 = $.child(span_2);

								Button(node_143, {
									get icon() {
										return mdiChevronDown;
									},
									rounded: true,
									class: 'px-1',
									$$events: {
										click: function (...$$args) {
											$.get(toggle)?.apply(this, $$args);
										}
									}
								});

								var node_144 = $.sibling(node_143, 2);

								Menu(node_144, {
									get open() {
										return $.get(open);
									},
									placement: 'bottom-start',
									$$events: {
										close: function (...$$args) {
											$.get(toggleOff)?.apply(this, $$args);
										}
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_36 = root_3();
										var node_145 = $.first_child(fragment_36);

										MenuItem(node_145, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_36 = $.text('Hello');

												$.append($$anchor, text_36);
											},
											$$slots: { default: true }
										});

										var node_146 = $.sibling(node_145, 2);

										MenuItem(node_146, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_37 = $.text('Hello');

												$.append($$anchor, text_37);
											},
											$$slots: { default: true }
										});

										var node_147 = $.sibling(node_146, 2);

										MenuItem(node_147, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_38 = $.text('Hello');

												$.append($$anchor, text_38);
											},
											$$slots: { default: true }
										});

										var node_148 = $.sibling(node_147, 2);

										MenuItem(node_148, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_39 = $.text('Hello');

												$.append($$anchor, text_39);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_36);
									},
									$$slots: { default: true }
								});

								$.reset(span_2);
								$.append($$anchor, span_2);
							}
						}
					});

					$.append($$anchor, fragment_35);
				},
				$$slots: { default: true }
			});

			var node_149 = $.sibling(node_140, 2);

			ButtonGroup(node_149, {
				variant: 'fill-light',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_37 = root_2();
					var node_150 = $.first_child(fragment_37);

					Button(node_150, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_40 = $.text('Click me');

							$.append($$anchor, text_40);
						},
						$$slots: { default: true }
					});

					var node_151 = $.sibling(node_150, 2);

					Toggle(node_151, {
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$anchor, $$slotProps) => {
								const open = $.derived(() => $$slotProps.on);
								const toggle = $.derived(() => $$slotProps.toggle);
								const toggleOff = $.derived(() => $$slotProps.toggleOff);
								var span_3 = root_4();
								var node_152 = $.child(span_3);

								Button(node_152, {
									get icon() {
										return mdiChevronDown;
									},
									rounded: true,
									class: 'px-1',
									$$events: {
										click: function (...$$args) {
											$.get(toggle)?.apply(this, $$args);
										}
									}
								});

								var node_153 = $.sibling(node_152, 2);

								Menu(node_153, {
									get open() {
										return $.get(open);
									},
									placement: 'bottom-start',
									$$events: {
										close: function (...$$args) {
											$.get(toggleOff)?.apply(this, $$args);
										}
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_38 = root_3();
										var node_154 = $.first_child(fragment_38);

										MenuItem(node_154, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_41 = $.text('Hello');

												$.append($$anchor, text_41);
											},
											$$slots: { default: true }
										});

										var node_155 = $.sibling(node_154, 2);

										MenuItem(node_155, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_42 = $.text('Hello');

												$.append($$anchor, text_42);
											},
											$$slots: { default: true }
										});

										var node_156 = $.sibling(node_155, 2);

										MenuItem(node_156, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_43 = $.text('Hello');

												$.append($$anchor, text_43);
											},
											$$slots: { default: true }
										});

										var node_157 = $.sibling(node_156, 2);

										MenuItem(node_157, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_44 = $.text('Hello');

												$.append($$anchor, text_44);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_38);
									},
									$$slots: { default: true }
								});

								$.reset(span_3);
								$.append($$anchor, span_3);
							}
						}
					});

					$.append($$anchor, fragment_37);
				},
				$$slots: { default: true }
			});

			var node_158 = $.sibling(node_149, 2);

			ButtonGroup(node_158, {
				variant: 'fill-outline',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_39 = root_2();
					var node_159 = $.first_child(fragment_39);

					Button(node_159, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_45 = $.text('Click me');

							$.append($$anchor, text_45);
						},
						$$slots: { default: true }
					});

					var node_160 = $.sibling(node_159, 2);

					Toggle(node_160, {
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$anchor, $$slotProps) => {
								const open = $.derived(() => $$slotProps.on);
								const toggle = $.derived(() => $$slotProps.toggle);
								const toggleOff = $.derived(() => $$slotProps.toggleOff);
								var span_4 = root_4();
								var node_161 = $.child(span_4);

								Button(node_161, {
									get icon() {
										return mdiChevronDown;
									},
									rounded: true,
									class: 'px-1',
									$$events: {
										click: function (...$$args) {
											$.get(toggle)?.apply(this, $$args);
										}
									}
								});

								var node_162 = $.sibling(node_161, 2);

								Menu(node_162, {
									get open() {
										return $.get(open);
									},
									placement: 'bottom-start',
									$$events: {
										close: function (...$$args) {
											$.get(toggleOff)?.apply(this, $$args);
										}
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_40 = root_3();
										var node_163 = $.first_child(fragment_40);

										MenuItem(node_163, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_46 = $.text('Hello');

												$.append($$anchor, text_46);
											},
											$$slots: { default: true }
										});

										var node_164 = $.sibling(node_163, 2);

										MenuItem(node_164, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_47 = $.text('Hello');

												$.append($$anchor, text_47);
											},
											$$slots: { default: true }
										});

										var node_165 = $.sibling(node_164, 2);

										MenuItem(node_165, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_48 = $.text('Hello');

												$.append($$anchor, text_48);
											},
											$$slots: { default: true }
										});

										var node_166 = $.sibling(node_165, 2);

										MenuItem(node_166, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_49 = $.text('Hello');

												$.append($$anchor, text_49);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_40);
									},
									$$slots: { default: true }
								});

								$.reset(span_4);
								$.append($$anchor, span_4);
							}
						}
					});

					$.append($$anchor, fragment_39);
				},
				$$slots: { default: true }
			});

			$.reset(div_6);
			$.append($$anchor, div_6);
		},
		$$slots: { default: true }
	});

	var node_167 = $.sibling(node_121, 4);

	Preview(node_167, {
		children: ($$anchor, $$slotProps) => {
			var div_7 = root_1();
			var node_168 = $.child(div_7);

			ButtonGroup(node_168, {
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_41 = root();
					var node_169 = $.first_child(fragment_41);

					Tooltip(node_169, {
						title: 'left',
						offset: 2,
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								get icon() {
									return mdiFormatAlignLeft;
								}
							});
						},
						$$slots: { default: true }
					});

					var node_170 = $.sibling(node_169, 2);

					Tooltip(node_170, {
						title: 'center',
						offset: 2,
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								get icon() {
									return mdiFormatAlignCenter;
								}
							});
						},
						$$slots: { default: true }
					});

					var node_171 = $.sibling(node_170, 2);

					Tooltip(node_171, {
						title: 'right',
						offset: 2,
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								get icon() {
									return mdiFormatAlignRight;
								}
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_41);
				},
				$$slots: { default: true }
			});

			var node_172 = $.sibling(node_168, 2);

			ButtonGroup(node_172, {
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					var fragment_45 = root();
					var node_173 = $.first_child(fragment_45);

					Tooltip(node_173, {
						title: 'left',
						offset: 2,
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								get icon() {
									return mdiFormatAlignLeft;
								}
							});
						},
						$$slots: { default: true }
					});

					var node_174 = $.sibling(node_173, 2);

					Tooltip(node_174, {
						title: 'center',
						offset: 2,
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								get icon() {
									return mdiFormatAlignCenter;
								}
							});
						},
						$$slots: { default: true }
					});

					var node_175 = $.sibling(node_174, 2);

					Tooltip(node_175, {
						title: 'right',
						offset: 2,
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								get icon() {
									return mdiFormatAlignRight;
								}
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_45);
				},
				$$slots: { default: true }
			});

			var node_176 = $.sibling(node_172, 2);

			ButtonGroup(node_176, {
				variant: 'fill',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_49 = root();
					var node_177 = $.first_child(fragment_49);

					Tooltip(node_177, {
						title: 'left',
						offset: 2,
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								get icon() {
									return mdiFormatAlignLeft;
								}
							});
						},
						$$slots: { default: true }
					});

					var node_178 = $.sibling(node_177, 2);

					Tooltip(node_178, {
						title: 'center',
						offset: 2,
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								get icon() {
									return mdiFormatAlignCenter;
								}
							});
						},
						$$slots: { default: true }
					});

					var node_179 = $.sibling(node_178, 2);

					Tooltip(node_179, {
						title: 'right',
						offset: 2,
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								get icon() {
									return mdiFormatAlignRight;
								}
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_49);
				},
				$$slots: { default: true }
			});

			var node_180 = $.sibling(node_176, 2);

			ButtonGroup(node_180, {
				variant: 'fill-light',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_53 = root();
					var node_181 = $.first_child(fragment_53);

					Tooltip(node_181, {
						title: 'left',
						offset: 2,
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								get icon() {
									return mdiFormatAlignLeft;
								}
							});
						},
						$$slots: { default: true }
					});

					var node_182 = $.sibling(node_181, 2);

					Tooltip(node_182, {
						title: 'center',
						offset: 2,
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								get icon() {
									return mdiFormatAlignCenter;
								}
							});
						},
						$$slots: { default: true }
					});

					var node_183 = $.sibling(node_182, 2);

					Tooltip(node_183, {
						title: 'right',
						offset: 2,
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								get icon() {
									return mdiFormatAlignRight;
								}
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_53);
				},
				$$slots: { default: true }
			});

			var node_184 = $.sibling(node_180, 2);

			ButtonGroup(node_184, {
				variant: 'fill-outline',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					var fragment_57 = root();
					var node_185 = $.first_child(fragment_57);

					Tooltip(node_185, {
						title: 'left',
						offset: 2,
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								get icon() {
									return mdiFormatAlignLeft;
								}
							});
						},
						$$slots: { default: true }
					});

					var node_186 = $.sibling(node_185, 2);

					Tooltip(node_186, {
						title: 'center',
						offset: 2,
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								get icon() {
									return mdiFormatAlignCenter;
								}
							});
						},
						$$slots: { default: true }
					});

					var node_187 = $.sibling(node_186, 2);

					Tooltip(node_187, {
						title: 'right',
						offset: 2,
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								get icon() {
									return mdiFormatAlignRight;
								}
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_57);
				},
				$$slots: { default: true }
			});

			$.reset(div_7);
			$.append($$anchor, div_7);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}