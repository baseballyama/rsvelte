import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import Button from "$lib/button/button.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import Text from "$lib/text/text.svelte";
import Tooltip from "$lib/tooltip/tooltip.svelte";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";
import { gray, grayAlpha, blue, red, amber, green, teal, purple, pink } from "../../docs/data/colors.js";
import Hr from "../../docs/ui/hr.svelte";

const error = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
};

const colSnip = ($$anchor, title = $.noop, colorList = $.noop) => {
	var div = root_3();
	var div_1 = $.child(div);
	var p = $.child(div_1);
	var text = $.only_child(p, true);

	$.reset(div_1);

	var ul = $.sibling(div_1, 2);

	$.each(ul, 21, colorList, $.index, ($$anchor, item) => {
		var li = root_2();
		var node = $.child(li);

		Tooltip(node, {
			position: 'top',
			get text() {
				return $.get(item);
			},

			children: ($$anchor, $$slotProps) => {
				var div_2 = root_1();
				var button = $.only_child(div_2);

				$.template_effect(() => {
					$.set_attribute(button, 'aria-label', $.get(item));
					$.set_class(button, 1, `border-kui-light-gray-alpha-200/5 dark:border-kui-dark-gray-alpha-200/5 h-7.5 w-full rounded-sm border md:h-10 ${$.get(item) ?? ''}`);
				});

				$.append($$anchor, div_2);
			},
			$$slots: { default: true }
		});

		$.reset(li);
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(div);
	$.template_effect(() => $.set_text(text, title()));
	$.append($$anchor, div);
};

const scales = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_6();
			var node_1 = $.first_child(fragment_3);

			LinkH2(node_1, {
				href: '/colors#size',
				'aria-label': 'size',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('size');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var div_3 = $.sibling(node_1, 4);
			var div_4 = $.child(div_3);
			var ul_1 = $.sibling($.child(div_4), 2);
			var li_1 = $.child(ul_1);
			var ul_2 = $.child(li_1);
			var li_2 = $.child(ul_2);
			var node_2 = $.child(li_2);

			Tooltip(node_2, {
				position: 'top',
				text: 'bg-kui-light-bg rounded-sm dark:bg-kui-dark-bg',
				class: 'h-full w-full',
				children: ($$anchor, $$slotProps) => {
					var div_5 = root_4();

					$.append($$anchor, div_5);
				},
				$$slots: { default: true }
			});

			$.reset(li_2);

			var li_3 = $.sibling(li_2, 2);
			var node_3 = $.child(li_3);

			Tooltip(node_3, {
				position: 'top',
				text: 'bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary',
				class: 'h-full w-full',
				children: ($$anchor, $$slotProps) => {
					var div_6 = root_5();

					$.append($$anchor, div_6);
				},
				$$slots: { default: true }
			});

			$.reset(li_3);
			$.reset(ul_2);
			$.reset(li_1);
			$.reset(ul_1);
			$.reset(div_4);

			var node_4 = $.sibling(div_4, 2);

			colSnip(node_4, () => "gray", () => gray);

			var node_5 = $.sibling(node_4, 2);

			colSnip(node_5, () => "gray alpha", () => grayAlpha);

			var node_6 = $.sibling(node_5, 2);

			colSnip(node_6, () => "blue", () => blue);

			var node_7 = $.sibling(node_6, 2);

			colSnip(node_7, () => "red", () => red);

			var node_8 = $.sibling(node_7, 2);

			colSnip(node_8, () => "amber", () => amber);

			var node_9 = $.sibling(node_8, 2);

			colSnip(node_9, () => "green", () => green);

			var node_10 = $.sibling(node_9, 2);

			colSnip(node_10, () => "teal", () => teal);

			var node_11 = $.sibling(node_10, 2);

			colSnip(node_11, () => "purple", () => purple);

			var node_12 = $.sibling(node_11, 2);

			colSnip(node_12, () => "pink", () => pink);
			$.reset(div_3);
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});
};

const backgrounds = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_9();
			var node_13 = $.first_child(fragment_5);

			LinkH2(node_13, {
				href: '/colors#backgrounds',
				'aria-label': 'backgrounds',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('backgrounds');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var div_7 = $.sibling(node_13, 4);
			var div_8 = $.child(div_7);
			var div_9 = $.child(div_8);
			var div_10 = $.child(div_9);
			var node_14 = $.child(div_10);

			Tooltip(node_14, {
				position: 'right',
				text: 'bg-kui-light-bg dark:bg-kui-dark-bg',
				class: 'h-full w-full',
				children: ($$anchor, $$slotProps) => {
					var div_11 = root_7();

					$.append($$anchor, div_11);
				},
				$$slots: { default: true }
			});

			$.reset(div_10);

			var node_15 = $.sibling(div_10, 2);

			Text(node_15, {
				size: 14,
				class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Background 1');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.reset(div_9);

			var node_16 = $.sibling(div_9, 2);

			Text(node_16, {
				size: 14,
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Default element background');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.reset(div_8);

			var node_17 = $.sibling(div_8, 2);

			Hr(node_17, { class: 'py-2' });

			var div_12 = $.sibling(node_17, 2);
			var div_13 = $.child(div_12);
			var div_14 = $.child(div_13);
			var node_18 = $.child(div_14);

			Tooltip(node_18, {
				position: 'right',
				text: 'bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary',
				class: 'h-full w-full',
				children: ($$anchor, $$slotProps) => {
					var div_15 = root_8();

					$.append($$anchor, div_15);
				},
				$$slots: { default: true }
			});

			$.reset(div_14);

			var node_19 = $.sibling(div_14, 2);

			Text(node_19, {
				size: 14,
				class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Background 2');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			$.reset(div_13);

			var node_20 = $.sibling(div_13, 2);

			Text(node_20, {
				size: 14,
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Secondary background');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			$.reset(div_12);
			$.reset(div_7);
			$.next(2);
			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});
};

const compactBackgrounds = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root_13();
			var node_21 = $.first_child(fragment_7);

			LinkH2(node_21, {
				href: '/colors#colors-1-3:-component-backgrounds',
				'aria-label': 'Colors 1-3: Component Backgrounds',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('Colors 1-3: Component Backgrounds');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			var div_16 = $.sibling(node_21, 4);
			var div_17 = $.child(div_16);
			var div_18 = $.child(div_17);
			var div_19 = $.child(div_18);
			var node_22 = $.child(div_19);

			Tooltip(node_22, {
				position: 'right',
				text: 'bg-kui-light-gray-100 dark:bg-kui-dark-gray-100',
				class: 'h-full w-full',
				children: ($$anchor, $$slotProps) => {
					var div_20 = root_10();

					$.append($$anchor, div_20);
				},
				$$slots: { default: true }
			});

			$.reset(div_19);

			var node_23 = $.sibling(div_19, 2);

			Text(node_23, {
				size: 14,
				class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('Color 1');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});

			$.reset(div_18);

			var node_24 = $.sibling(div_18, 2);

			Text(node_24, {
				size: 14,
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_9 = $.text('Default background');

					$.append($$anchor, text_9);
				},
				$$slots: { default: true }
			});

			$.reset(div_17);

			var node_25 = $.sibling(div_17, 2);

			Hr(node_25, { class: 'py-3' });

			var div_21 = $.sibling(node_25, 2);
			var div_22 = $.child(div_21);
			var div_23 = $.child(div_22);
			var node_26 = $.child(div_23);

			Tooltip(node_26, {
				position: 'right',
				text: 'bg-kui-light-gray-200 dark:bg-kui-dark-gray-200',
				class: 'h-full w-full',
				children: ($$anchor, $$slotProps) => {
					var div_24 = root_11();

					$.append($$anchor, div_24);
				},
				$$slots: { default: true }
			});

			$.reset(div_23);

			var node_27 = $.sibling(div_23, 2);

			Text(node_27, {
				size: 14,
				class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_10 = $.text('Color 2');

					$.append($$anchor, text_10);
				},
				$$slots: { default: true }
			});

			$.reset(div_22);

			var node_28 = $.sibling(div_22, 2);

			Text(node_28, {
				size: 14,
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_11 = $.text('Hover background');

					$.append($$anchor, text_11);
				},
				$$slots: { default: true }
			});

			$.reset(div_21);

			var node_29 = $.sibling(div_21, 2);

			Hr(node_29, { class: 'py-3' });

			var div_25 = $.sibling(node_29, 2);
			var div_26 = $.child(div_25);
			var div_27 = $.child(div_26);
			var node_30 = $.child(div_27);

			Tooltip(node_30, {
				position: 'right',
				text: 'bg-kui-light-gray-300 dark:bg-kui-dark-gray-300',
				class: 'h-full w-full',
				children: ($$anchor, $$slotProps) => {
					var div_28 = root_12();

					$.append($$anchor, div_28);
				},
				$$slots: { default: true }
			});

			$.reset(div_27);

			var node_31 = $.sibling(div_27, 2);

			Text(node_31, {
				size: 14,
				class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_12 = $.text('Color 3');

					$.append($$anchor, text_12);
				},
				$$slots: { default: true }
			});

			$.reset(div_26);

			var node_32 = $.sibling(div_26, 2);

			Text(node_32, {
				size: 14,
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_13 = $.text('Active background');

					$.append($$anchor, text_13);
				},
				$$slots: { default: true }
			});

			$.reset(div_25);
			$.reset(div_16);
			$.next(2);
			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});
};

const borders = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root_17();
			var node_33 = $.first_child(fragment_9);

			LinkH2(node_33, {
				href: '/colors#colors-4-6:-borders',
				'aria-label': 'Colors 4-6: Borders',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_14 = $.text('colors 4-6: borders');

					$.append($$anchor, text_14);
				},
				$$slots: { default: true }
			});

			var div_29 = $.sibling(node_33, 4);
			var div_30 = $.child(div_29);
			var div_31 = $.child(div_30);
			var div_32 = $.child(div_31);
			var node_34 = $.child(div_32);

			Tooltip(node_34, {
				position: 'right',
				text: 'border-kui-light-gray-alpha-200 dark:border-kui-dark-gray-alpha-200',
				class: 'h-full w-full',
				children: ($$anchor, $$slotProps) => {
					var div_33 = root_14();

					$.append($$anchor, div_33);
				},
				$$slots: { default: true }
			});

			$.reset(div_32);

			var node_35 = $.sibling(div_32, 2);

			Text(node_35, {
				size: 14,
				class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_15 = $.text('Color 4');

					$.append($$anchor, text_15);
				},
				$$slots: { default: true }
			});

			$.reset(div_31);

			var node_36 = $.sibling(div_31, 2);

			Text(node_36, {
				size: 14,
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_16 = $.text('Default border');

					$.append($$anchor, text_16);
				},
				$$slots: { default: true }
			});

			$.reset(div_30);

			var node_37 = $.sibling(div_30, 2);

			Hr(node_37, { class: 'py-3' });

			var div_34 = $.sibling(node_37, 2);
			var div_35 = $.child(div_34);
			var div_36 = $.child(div_35);
			var node_38 = $.child(div_36);

			Tooltip(node_38, {
				position: 'right',
				text: 'border-kui-light-gray-500 dark:border-kui-dark-gray-500',
				class: 'h-full w-full',
				children: ($$anchor, $$slotProps) => {
					var div_37 = root_15();

					$.append($$anchor, div_37);
				},
				$$slots: { default: true }
			});

			$.reset(div_36);

			var node_39 = $.sibling(div_36, 2);

			Text(node_39, {
				size: 14,
				class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_17 = $.text('Color 5');

					$.append($$anchor, text_17);
				},
				$$slots: { default: true }
			});

			$.reset(div_35);

			var node_40 = $.sibling(div_35, 2);

			Text(node_40, {
				size: 14,
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_18 = $.text('Hover border');

					$.append($$anchor, text_18);
				},
				$$slots: { default: true }
			});

			$.reset(div_34);

			var node_41 = $.sibling(div_34, 2);

			Hr(node_41, { class: 'py-3' });

			var div_38 = $.sibling(node_41, 2);
			var div_39 = $.child(div_38);
			var div_40 = $.child(div_39);
			var node_42 = $.child(div_40);

			Tooltip(node_42, {
				position: 'right',
				text: 'border-kui-light-gray-600 dark:border-kui-dark-gray-600',
				class: 'h-full w-full',
				children: ($$anchor, $$slotProps) => {
					var div_41 = root_16();

					$.append($$anchor, div_41);
				},
				$$slots: { default: true }
			});

			$.reset(div_40);

			var node_43 = $.sibling(div_40, 2);

			Text(node_43, {
				size: 14,
				class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_19 = $.text('Color 6');

					$.append($$anchor, text_19);
				},
				$$slots: { default: true }
			});

			$.reset(div_39);

			var node_44 = $.sibling(div_39, 2);

			Text(node_44, {
				size: 14,
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_20 = $.text('Active border');

					$.append($$anchor, text_20);
				},
				$$slots: { default: true }
			});

			$.reset(div_38);
			$.reset(div_29);

			var div_42 = $.sibling(div_29, 2);
			var node_45 = $.child(div_42);

			Button(node_45, {
				variant: 'secondary',
				class: 'min-w-[160px]',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_21 = $.text('New Project');

					$.append($$anchor, text_21);
				},
				$$slots: { default: true }
			});

			$.reset(div_42);
			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});
};

const contrast = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_11 = root_20();
			var node_46 = $.first_child(fragment_11);

			LinkH2(node_46, {
				href: '/colors#colors-7-8:-high-contrast-backgrounds',
				'aria-label': 'Colors 7-8: High Contrast Backgrounds',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_22 = $.text('Colors 7-8: High Contrast Backgrounds');

					$.append($$anchor, text_22);
				},
				$$slots: { default: true }
			});

			var div_43 = $.sibling(node_46, 4);
			var div_44 = $.child(div_43);
			var div_45 = $.child(div_44);
			var div_46 = $.child(div_45);
			var node_47 = $.child(div_46);

			Tooltip(node_47, {
				position: 'right',
				text: 'border-kui-light-gray-700 dark:border-kui-dark-gray-700',
				class: 'h-full w-full',
				children: ($$anchor, $$slotProps) => {
					var div_47 = root_18();

					$.append($$anchor, div_47);
				},
				$$slots: { default: true }
			});

			$.reset(div_46);

			var node_48 = $.sibling(div_46, 2);

			Text(node_48, {
				size: 14,
				class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_23 = $.text('Color 7');

					$.append($$anchor, text_23);
				},
				$$slots: { default: true }
			});

			$.reset(div_45);

			var node_49 = $.sibling(div_45, 2);

			Text(node_49, {
				size: 14,
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_24 = $.text('High contrast background');

					$.append($$anchor, text_24);
				},
				$$slots: { default: true }
			});

			$.reset(div_44);

			var node_50 = $.sibling(div_44, 2);

			Hr(node_50, { class: 'py-3' });

			var div_48 = $.sibling(node_50, 2);
			var div_49 = $.child(div_48);
			var div_50 = $.child(div_49);
			var node_51 = $.child(div_50);

			Tooltip(node_51, {
				position: 'right',
				text: 'border-kui-light-gray-800 dark:border-kui-dark-gray-800',
				class: 'h-full w-full',
				children: ($$anchor, $$slotProps) => {
					var div_51 = root_19();

					$.append($$anchor, div_51);
				},
				$$slots: { default: true }
			});

			$.reset(div_50);

			var node_52 = $.sibling(div_50, 2);

			Text(node_52, {
				size: 14,
				class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_25 = $.text('Color 8');

					$.append($$anchor, text_25);
				},
				$$slots: { default: true }
			});

			$.reset(div_49);

			var node_53 = $.sibling(div_49, 2);

			Text(node_53, {
				size: 14,
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_26 = $.text('Hover high contrast background');

					$.append($$anchor, text_26);
				},
				$$slots: { default: true }
			});

			$.reset(div_48);
			$.reset(div_43);
			$.append($$anchor, fragment_11);
		},
		$$slots: { default: true }
	});
};

const textIcon = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_13 = root_23();
			var node_54 = $.first_child(fragment_13);

			LinkH2(node_54, {
				href: '/colors#colors-9-10:-text-and-icons',
				'aria-label': 'Colors 9-10: Text and Icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_27 = $.text('Colors 9-10: Text and Icons');

					$.append($$anchor, text_27);
				},
				$$slots: { default: true }
			});

			var div_52 = $.sibling(node_54, 4);
			var div_53 = $.child(div_52);
			var div_54 = $.child(div_53);
			var div_55 = $.child(div_54);
			var node_55 = $.child(div_55);

			Tooltip(node_55, {
				position: 'right',
				text: 'border-kui-light-gray-900 dark:border-kui-dark-gray-700',
				class: 'h-full w-full',
				children: ($$anchor, $$slotProps) => {
					var div_56 = root_21();

					$.append($$anchor, div_56);
				},
				$$slots: { default: true }
			});

			$.reset(div_55);

			var node_56 = $.sibling(div_55, 2);

			Text(node_56, {
				size: 14,
				class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_28 = $.text('Color 9');

					$.append($$anchor, text_28);
				},
				$$slots: { default: true }
			});

			$.reset(div_54);

			var node_57 = $.sibling(div_54, 2);

			Text(node_57, {
				size: 14,
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_29 = $.text('Secondary text and icons');

					$.append($$anchor, text_29);
				},
				$$slots: { default: true }
			});

			$.reset(div_53);

			var node_58 = $.sibling(div_53, 2);

			Hr(node_58, { class: 'py-3' });

			var div_57 = $.sibling(node_58, 2);
			var div_58 = $.child(div_57);
			var div_59 = $.child(div_58);
			var node_59 = $.child(div_59);

			Tooltip(node_59, {
				position: 'right',
				text: 'border-kui-light-gray-1000 dark:border-kui-dark-gray-1000',
				class: 'h-full w-full',
				children: ($$anchor, $$slotProps) => {
					var div_60 = root_22();

					$.append($$anchor, div_60);
				},
				$$slots: { default: true }
			});

			$.reset(div_59);

			var node_60 = $.sibling(div_59, 2);

			Text(node_60, {
				size: 14,
				class: 'text-kui-light-gray-1000 dark:text-kui-dark-gray-1000',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_30 = $.text('Color 10');

					$.append($$anchor, text_30);
				},
				$$slots: { default: true }
			});

			$.reset(div_58);

			var node_61 = $.sibling(div_58, 2);

			Text(node_61, {
				size: 14,
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_31 = $.text('Primary text and icons');

					$.append($$anchor, text_31);
				},
				$$slots: { default: true }
			});

			$.reset(div_57);
			$.reset(div_52);
			$.append($$anchor, fragment_13);
		},
		$$slots: { default: true }
	});
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "installation", href: "/installation" },
				next: { title: "avatar", href: "/avatar" }
			});
		},
		$$slots: { default: true }
	});
};

const cont = ($$anchor) => {
	var fragment_16 = root_24();
	var node_62 = $.first_child(fragment_16);

	error(node_62);

	var node_63 = $.sibling(node_62, 2);

	scales(node_63);

	var node_64 = $.sibling(node_63, 2);

	backgrounds(node_64);

	var node_65 = $.sibling(node_64, 2);

	compactBackgrounds(node_65);

	var node_66 = $.sibling(node_65, 2);

	borders(node_66);

	var node_67 = $.sibling(node_66, 2);

	contrast(node_67);

	var node_68 = $.sibling(node_67, 2);

	textIcon(node_68);

	var node_69 = $.sibling(node_68, 2);

	prevAndNext(node_69);
	$.append($$anchor, fragment_16);
};

const aside = ($$anchor) => {
	Aside($$anchor, {
		get asideDataList() {
			return asideData;
		}
	});
};

var root = $.from_html(
	`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">colors</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">Learn how to use our color system. Hover over each color to view the corresponding
			colors.</p>`,
	1
);

var root_1 = $.from_html(`<div class="flex h-full w-full items-center"><button></button></div>`);
var root_2 = $.from_html(`<li class="w-full max-w-17"><!></li>`);
var root_3 = $.from_html(`<div class="flex flex-col items-start gap-2 md:flex-row md:items-center"><div class="w-25 shrink-0"><p class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 text-sm font-medium first-letter:capitalize"> </p></div> <ul class="flex w-full gap-1 md:gap-2"></ul></div>`);
var root_4 = $.from_html(`<div class="flex h-full w-full items-center"><button aria-label="gray" class="border-kui-light-gray-alpha-200 dark:border-kui-dark-gray-alpha-200 bg-kui-light-bg dark:bg-kui-dark-bg h-8.5 w-full rounded-sm border lg:h-10"></button></div>`);
var root_5 = $.from_html(`<div class="flex h-full w-full items-center"><button aria-label="gray alpha" class="border-kui-light-gray-alpha-200 dark:border-kui-dark-gray-alpha-200 bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary h-8.5 w-full rounded-sm border lg:h-10"></button></div>`);

var root_6 = $.from_html(
	`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">There are 10 color scales in the system. P3 colors are used on supported browsers and
			displays.</p> <div class="mt-5 space-y-6 xl:mt-10"><div class="flex flex-col items-start gap-2 md:flex-row md:items-center"><div class="w-25 shrink-0"><p class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 text-sm font-medium capitalize">background</p></div> <ul class="flex w-full gap-1 md:gap-2"><li class="flex w-18 items-center gap-1 md:w-38 md:gap-2"><ul class="flex w-full items-center gap-1 md:gap-2"><li class="w-full max-w-17"><!></li> <li class="w-full max-w-17"><!></li></ul></li></ul></div> <!> <!> <!> <!> <!> <!> <!> <!> <!></div>`,
	1
);

var root_7 = $.from_html(`<div class="border-kui-light-gray-alpha-200 dark:border-kui-dark-gray-alpha-200 bg-kui-light-bg dark:bg-kui-dark-bg h-4 w-4 rounded-full border"></div>`);
var root_8 = $.from_html(`<div class="border-kui-light-gray-alpha-200 dark:border-kui-dark-gray-alpha-200 bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary h-4 w-4 rounded-full border"></div>`);

var root_9 = $.from_html(
	`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">There are two background colors for pages and UI components. In most instances, you
			should use Background 1—especially when color is being placed on top of the background.
			Background 2 should be used sparingly when a subtle background differentiation is needed.</p> <div class="w-full py-5"><div class="flex items-center gap-8"><div class="flex items-center gap-2"><div class="h-4 w-4 cursor-pointer"><!></div> <!></div> <!></div> <!> <div class="flex items-center gap-8"><div class="flex items-center gap-2"><div class="h-4 w-4"><!></div> <!></div> <!></div></div> <div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-alpha-200 dark:border-kui-dark-gray-alpha-200 mt-10 flex h-175 w-full flex-col border md:h-103 md:flex-row"><div class="border-kui-light-gray-alpha-200 dark:border-kui-dark-gray-alpha-200 flex h-[50%] items-center justify-center border-r md:h-full md:w-[50%]"><div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-alpha-200 dark:border-kui-dark-gray-alpha-200 relative flex h-41 w-41 items-center justify-center rounded-xl border"><div class="bg-kui-light-gray-alpha-100 dark:bg-kui-dark-gray-alpha-100 text-kui-light-gray-900 dark:text-kui-dark-gray-900 flex h-6 w-6 items-center justify-center rounded-full text-xs">1</div> <div class="bg-kui-light-gray-alpha-100 dark:bg-kui-dark-gray-alpha-100 text-kui-light-gray-900 dark:text-kui-dark-gray-900 absolute bottom-[-57px] flex h-6 w-6 items-center justify-center rounded-full text-xs">2</div></div></div> <div class="bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary flex h-[50%] items-center justify-center md:h-full md:w-[50%]"><div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-alpha-200 dark:border-kui-dark-gray-alpha-200 relative flex h-[164px] w-[164px] items-center justify-center rounded-[12px] border"><div class="bg-kui-light-gray-alpha-100 dark:bg-kui-dark-gray-alpha-100 text-kui-light-gray-900 dark:text-kui-dark-gray-900 flex h-6 w-6 items-center justify-center rounded-full text-xs">1</div> <div class="bg-kui-light-gray-alpha-100 dark:bg-kui-dark-gray-alpha-100 text-kui-light-gray-900 dark:text-kui-dark-gray-900 absolute bottom-[-57px] flex h-6 w-6 items-center justify-center rounded-full text-xs">2</div></div></div></div>`,
	1
);

var root_10 = $.from_html(`<div class="border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 bg-kui-light-gray-100 dark:bg-kui-dark-gray-100 h-4 w-4 rounded-full border"></div>`);
var root_11 = $.from_html(`<div class="border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 bg-kui-light-gray-200 dark:bg-kui-dark-gray-200 h-4 w-4 rounded-full border"></div>`);
var root_12 = $.from_html(`<div class="border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 bg-kui-light-gray-300 dark:bg-kui-dark-gray-300 h-4 w-4 rounded-full border"></div>`);

var root_13 = $.from_html(
	`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">These three colors are designed for UI component backgrounds.</p> <div class="w-full pt-[20px]"><div class="flex items-center gap-8"><div class="flex items-center gap-2"><div class="h-4 w-4 cursor-pointer"><!></div> <!></div> <!></div> <!> <div class="flex items-center gap-8"><div class="flex items-center gap-2"><div class="h-4 w-4"><!></div> <!></div> <!></div> <!> <div class="flex items-center gap-8"><div class="flex items-center gap-2"><div class="h-4 w-4"><!></div> <!></div> <!></div></div> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">If your UI component’s default background is Background 1, you can use Color 1 as your
			hover background and Color 2 as your active background. On smaller UI elements like
			badges, you can use Color 2 or Color 3 as the background.</p>`,
	1
);

var root_14 = $.from_html(`<div class="border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 bg-kui-light-gray-400 dark:bg-kui-dark-gray-400 h-4 w-4 rounded-full border"></div>`);
var root_15 = $.from_html(`<div class="border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 bg-kui-light-gray-500 dark:bg-kui-dark-gray-500 h-4 w-4 rounded-full border"></div>`);
var root_16 = $.from_html(`<div class="border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 bg-kui-light-gray-600 dark:bg-kui-dark-gray-600 h-4 w-4 rounded-full border"></div>`);
var root_17 = $.from_html(`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">These three colors are designed for UI component borders.</p> <div class="w-full pt-[20px]"><div class="flex items-center gap-8"><div class="flex items-center gap-2"><div class="h-4 w-4 cursor-pointer"><!></div> <!></div> <!></div> <!> <div class="flex items-center gap-8"><div class="flex items-center gap-2"><div class="h-4 w-4"><!></div> <!></div> <!></div> <!> <div class="flex items-center gap-8"><div class="flex items-center gap-2"><div class="h-4 w-4"><!></div> <!></div> <!></div></div> <div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-alpha-200 dark:border-kui-dark-gray-alpha-200 mt-10 flex h-[136px] w-full items-center justify-center border"><!></div>`, 1);
var root_18 = $.from_html(`<div class="border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 bg-kui-light-gray-700 dark:bg-kui-dark-gray-700 h-4 w-4 rounded-full border"></div>`);
var root_19 = $.from_html(`<div class="border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 bg-kui-light-gray-800 dark:bg-kui-dark-gray-800 h-4 w-4 rounded-full border"></div>`);
var root_20 = $.from_html(`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">These two colors are designed for high contrast UI component backgrounds.</p> <div class="w-full pt-[20px]"><div class="flex items-center gap-8"><div class="flex items-center gap-2"><div class="h-4 w-4 cursor-pointer"><!></div> <!></div> <!></div> <!> <div class="flex items-center gap-8"><div class="flex items-center gap-2"><div class="h-4 w-4"><!></div> <!></div> <!></div></div>`, 1);
var root_21 = $.from_html(`<div class="border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 bg-kui-light-gray-900 dark:bg-kui-dark-gray-900 h-4 w-4 rounded-full border"></div>`);
var root_22 = $.from_html(`<div class="border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400 bg-kui-light-gray-1000 dark:bg-kui-dark-gray-1000 h-4 w-4 rounded-full border"></div>`);
var root_23 = $.from_html(`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">These two colors are designed for accessible text and icons.</p> <div class="w-full pt-[20px]"><div class="flex items-center gap-8"><div class="flex items-center gap-2"><div class="h-4 w-4 cursor-pointer"><!></div> <!></div> <!></div> <!> <div class="flex items-center gap-8"><div class="flex items-center gap-2"><div class="h-4 w-4"><!></div> <!></div> <!></div></div>`, 1);
var root_24 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	$.head('f1j3j9', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Colors';
		});
	});

	Shell($$anchor, {
		get asideSlot() {
			return aside;
		},

		get contSlot() {
			return cont;
		}
	});
}