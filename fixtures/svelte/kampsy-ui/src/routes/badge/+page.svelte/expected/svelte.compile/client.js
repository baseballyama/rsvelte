import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import Badge from "$lib/badge/badge.svelte";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import { badgeSize, badgeVariants, badgeWithIcon, badgePill } from "$lib/../docs/data/badge.js";
import { ExternalLink, Shield } from "@lucide/svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

const badge = ($$anchor, title = $.noop, para = $.noop) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var h1 = $.first_child(fragment_1);
			var text = $.only_child(h1, true);
			var p = $.sibling(h1, 2);
			var text_1 = $.only_child(p, true);

			$.template_effect(() => {
				$.set_text(text, title());
				$.set_text(text_1, para());
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
};

const demoAndCode = ($$anchor, demo = $.noop, code = $.noop) => {
	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	$.snippet(node, demo);
	$.reset(div_2);
	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	CollapseCode(node_1, {
		get code() {
			return code();
		}
	});

	$.reset(div);
	$.append($$anchor, div);
};

const variants = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_3();
			var node_2 = $.first_child(fragment_3);

			LinkH2(node_2, {
				href: '/badge#variants',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Variants');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var div_3 = $.sibling(node_2, 2);

			{
				const demo = ($$anchor) => {
					var div_4 = root_2();
					var div_5 = $.child(div_4);
					var node_3 = $.child(div_5);

					Badge(node_3, {
						variant: 'gray',
						'aria-label': 'gray',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('gray');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					Badge(node_4, {
						variant: 'gray',
						contrast: 'low',
						'aria-label': 'gray-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('gray-subtle');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					$.reset(div_5);

					var div_6 = $.sibling(div_5, 2);
					var node_5 = $.child(div_6);

					Badge(node_5, {
						variant: 'blue',
						'aria-label': 'blue',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('blue');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					Badge(node_6, {
						variant: 'blue',
						contrast: 'low',
						'aria-label': 'blue-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('blue-subtle');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					$.reset(div_6);

					var div_7 = $.sibling(div_6, 2);
					var node_7 = $.child(div_7);

					Badge(node_7, {
						variant: 'purple',
						'aria-label': 'purple',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('purple');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					Badge(node_8, {
						variant: 'purple',
						contrast: 'low',
						'aria-label': 'purple-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('purple-subtle');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					$.reset(div_7);

					var div_8 = $.sibling(div_7, 2);
					var node_9 = $.child(div_8);

					Badge(node_9, {
						variant: 'amber',
						'aria-label': 'amber',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('amber');

							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					Badge(node_10, {
						variant: 'amber',
						contrast: 'low',
						'aria-label': 'amber-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text('amber-subtle');

							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});

					$.reset(div_8);

					var div_9 = $.sibling(div_8, 2);
					var node_11 = $.child(div_9);

					Badge(node_11, {
						variant: 'red',
						'aria-label': 'red',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_11 = $.text('red');

							$.append($$anchor, text_11);
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_11, 2);

					Badge(node_12, {
						variant: 'red',
						contrast: 'low',
						'aria-label': 'red-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_12 = $.text('red-subtle');

							$.append($$anchor, text_12);
						},
						$$slots: { default: true }
					});

					$.reset(div_9);

					var div_10 = $.sibling(div_9, 2);
					var node_13 = $.child(div_10);

					Badge(node_13, {
						variant: 'pink',
						'aria-label': 'pink',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_13 = $.text('pink');

							$.append($$anchor, text_13);
						},
						$$slots: { default: true }
					});

					var node_14 = $.sibling(node_13, 2);

					Badge(node_14, {
						variant: 'pink',
						contrast: 'low',
						'aria-label': 'pink-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_14 = $.text('pink-subtle');

							$.append($$anchor, text_14);
						},
						$$slots: { default: true }
					});

					$.reset(div_10);

					var div_11 = $.sibling(div_10, 2);
					var node_15 = $.child(div_11);

					Badge(node_15, {
						variant: 'green',
						'aria-label': 'green',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_15 = $.text('green');

							$.append($$anchor, text_15);
						},
						$$slots: { default: true }
					});

					var node_16 = $.sibling(node_15, 2);

					Badge(node_16, {
						variant: 'green',
						contrast: 'low',
						'aria-label': 'green-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_16 = $.text('green-subtle');

							$.append($$anchor, text_16);
						},
						$$slots: { default: true }
					});

					$.reset(div_11);

					var div_12 = $.sibling(div_11, 2);
					var node_17 = $.child(div_12);

					Badge(node_17, {
						variant: 'teal',
						'aria-label': 'teal',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_17 = $.text('teal');

							$.append($$anchor, text_17);
						},
						$$slots: { default: true }
					});

					var node_18 = $.sibling(node_17, 2);

					Badge(node_18, {
						variant: 'teal',
						contrast: 'low',
						'aria-label': 'teal-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_18 = $.text('teal-subtle');

							$.append($$anchor, text_18);
						},
						$$slots: { default: true }
					});

					$.reset(div_12);

					var div_13 = $.sibling(div_12, 2);
					var node_19 = $.child(div_13);

					Badge(node_19, {
						variant: 'inverted',
						'aria-label': 'inverted',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_19 = $.text('inverted');

							$.append($$anchor, text_19);
						},
						$$slots: { default: true }
					});

					var node_20 = $.sibling(node_19, 2);

					Badge(node_20, {
						variant: 'trial',
						'aria-label': 'trial',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_20 = $.text('Trial');

							$.append($$anchor, text_20);
						},
						$$slots: { default: true }
					});

					var node_21 = $.sibling(node_20, 2);

					Badge(node_21, {
						variant: 'turbo',
						'aria-label': 'turbo',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_21 = $.text('Turborepo');

							$.append($$anchor, text_21);
						},
						$$slots: { default: true }
					});

					$.reset(div_13);
					$.reset(div_4);
					$.append($$anchor, div_4);
				};

				var node_22 = $.child(div_3);

				demoAndCode(node_22, () => demo, () => badgeVariants);
				$.reset(div_3);
			}

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});
};

const size = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_3();
			var node_23 = $.first_child(fragment_5);

			LinkH2(node_23, {
				href: '/badge#sizes',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_22 = $.text('Sizes');

					$.append($$anchor, text_22);
				},
				$$slots: { default: true }
			});

			var div_14 = $.sibling(node_23, 2);

			{
				const demo = ($$anchor) => {
					var div_15 = root_4();
					var div_16 = $.child(div_15);
					var node_24 = $.child(div_16);

					Badge(node_24, {
						size: 'sm',
						'aria-label': 'small',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_23 = $.text('small');

							$.append($$anchor, text_23);
						},
						$$slots: { default: true }
					});

					$.reset(div_16);

					var div_17 = $.sibling(div_16, 2);
					var node_25 = $.child(div_17);

					Badge(node_25, {
						size: 'md',
						'aria-label': 'medium',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_24 = $.text('medium');

							$.append($$anchor, text_24);
						},
						$$slots: { default: true }
					});

					$.reset(div_17);

					var div_18 = $.sibling(div_17, 2);
					var node_26 = $.child(div_18);

					Badge(node_26, {
						size: 'lg',
						'aria-label': 'large',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_25 = $.text('large');

							$.append($$anchor, text_25);
						},
						$$slots: { default: true }
					});

					$.reset(div_18);
					$.reset(div_15);
					$.append($$anchor, div_15);
				};

				var node_27 = $.child(div_14);

				demoAndCode(node_27, () => demo, () => badgeSize);
				$.reset(div_14);
			}

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});
};

const icons = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root_3();
			var node_28 = $.first_child(fragment_7);

			LinkH2(node_28, {
				href: '/badge#with-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_26 = $.text('With Icons');

					$.append($$anchor, text_26);
				},
				$$slots: { default: true }
			});

			var div_19 = $.sibling(node_28, 2);

			{
				const demo = ($$anchor) => {
					var div_20 = root_5();
					var div_21 = $.child(div_20);
					var node_29 = $.child(div_21);

					Badge(node_29, {
						get icon() {
							return Shield;
						},
						size: 'lg',
						variant: 'gray',
						'aria-label': 'icon large gray',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_27 = $.text('gray');

							$.append($$anchor, text_27);
						},
						$$slots: { default: true }
					});

					var node_30 = $.sibling(node_29, 2);

					Badge(node_30, {
						get icon() {
							return Shield;
						},
						size: 'md',
						variant: 'gray',
						'aria-label': 'icon medium gray',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_28 = $.text('gray');

							$.append($$anchor, text_28);
						},
						$$slots: { default: true }
					});

					var node_31 = $.sibling(node_30, 2);

					Badge(node_31, {
						get icon() {
							return Shield;
						},
						size: 'sm',
						variant: 'gray',
						'aria-label': 'icon small gray',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_29 = $.text('gray');

							$.append($$anchor, text_29);
						},
						$$slots: { default: true }
					});

					var node_32 = $.sibling(node_31, 2);

					Badge(node_32, {
						get icon() {
							return Shield;
						},
						size: 'sm',
						variant: 'gray',
						contrast: 'low',
						'aria-label': 'icon small gray-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_30 = $.text('gray');

							$.append($$anchor, text_30);
						},
						$$slots: { default: true }
					});

					var node_33 = $.sibling(node_32, 2);

					Badge(node_33, {
						get icon() {
							return Shield;
						},
						size: 'md',
						variant: 'gray',
						contrast: 'low',
						'aria-label': 'icon medium gray-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_31 = $.text('gray');

							$.append($$anchor, text_31);
						},
						$$slots: { default: true }
					});

					var node_34 = $.sibling(node_33, 2);

					Badge(node_34, {
						get icon() {
							return Shield;
						},
						size: 'lg',
						variant: 'gray',
						contrast: 'low',
						'aria-label': 'icon large gray-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_32 = $.text('gray');

							$.append($$anchor, text_32);
						},
						$$slots: { default: true }
					});

					$.reset(div_21);

					var div_22 = $.sibling(div_21, 2);
					var node_35 = $.child(div_22);

					Badge(node_35, {
						get icon() {
							return Shield;
						},
						size: 'lg',
						variant: 'blue',
						'aria-label': 'icon large blue',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_33 = $.text('blue');

							$.append($$anchor, text_33);
						},
						$$slots: { default: true }
					});

					var node_36 = $.sibling(node_35, 2);

					Badge(node_36, {
						get icon() {
							return Shield;
						},
						size: 'md',
						variant: 'blue',
						'aria-label': 'icon medium blue',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_34 = $.text('blue');

							$.append($$anchor, text_34);
						},
						$$slots: { default: true }
					});

					var node_37 = $.sibling(node_36, 2);

					Badge(node_37, {
						get icon() {
							return Shield;
						},
						size: 'sm',
						variant: 'blue',
						'aria-label': 'icon small blue',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_35 = $.text('blue');

							$.append($$anchor, text_35);
						},
						$$slots: { default: true }
					});

					var node_38 = $.sibling(node_37, 2);

					Badge(node_38, {
						get icon() {
							return Shield;
						},
						size: 'sm',
						variant: 'blue',
						contrast: 'low',
						'aria-label': 'icon small blue-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_36 = $.text('blue');

							$.append($$anchor, text_36);
						},
						$$slots: { default: true }
					});

					var node_39 = $.sibling(node_38, 2);

					Badge(node_39, {
						get icon() {
							return Shield;
						},
						size: 'md',
						variant: 'blue',
						contrast: 'low',
						'aria-label': 'icon medium blue-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_37 = $.text('blue');

							$.append($$anchor, text_37);
						},
						$$slots: { default: true }
					});

					var node_40 = $.sibling(node_39, 2);

					Badge(node_40, {
						get icon() {
							return Shield;
						},
						size: 'lg',
						variant: 'blue',
						contrast: 'low',
						'aria-label': 'icon large blue-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_38 = $.text('blue');

							$.append($$anchor, text_38);
						},
						$$slots: { default: true }
					});

					$.reset(div_22);

					var div_23 = $.sibling(div_22, 2);
					var node_41 = $.child(div_23);

					Badge(node_41, {
						get icon() {
							return Shield;
						},
						size: 'lg',
						variant: 'purple',
						'aria-label': 'icon large purple',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_39 = $.text('purple');

							$.append($$anchor, text_39);
						},
						$$slots: { default: true }
					});

					var node_42 = $.sibling(node_41, 2);

					Badge(node_42, {
						get icon() {
							return Shield;
						},
						size: 'md',
						variant: 'purple',
						'aria-label': 'icon medium purple',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_40 = $.text('purple');

							$.append($$anchor, text_40);
						},
						$$slots: { default: true }
					});

					var node_43 = $.sibling(node_42, 2);

					Badge(node_43, {
						get icon() {
							return Shield;
						},
						size: 'sm',
						variant: 'purple',
						'aria-label': 'icon small purple',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_41 = $.text('purple');

							$.append($$anchor, text_41);
						},
						$$slots: { default: true }
					});

					var node_44 = $.sibling(node_43, 2);

					Badge(node_44, {
						get icon() {
							return Shield;
						},
						size: 'sm',
						variant: 'purple',
						contrast: 'low',
						'aria-label': 'icon small purple-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_42 = $.text('purple');

							$.append($$anchor, text_42);
						},
						$$slots: { default: true }
					});

					var node_45 = $.sibling(node_44, 2);

					Badge(node_45, {
						get icon() {
							return Shield;
						},
						size: 'md',
						variant: 'purple',
						contrast: 'low',
						'aria-label': 'icon medium purple-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_43 = $.text('purple');

							$.append($$anchor, text_43);
						},
						$$slots: { default: true }
					});

					var node_46 = $.sibling(node_45, 2);

					Badge(node_46, {
						get icon() {
							return Shield;
						},
						size: 'lg',
						variant: 'purple',
						contrast: 'low',
						'aria-label': 'icon large purple-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_44 = $.text('purple');

							$.append($$anchor, text_44);
						},
						$$slots: { default: true }
					});

					$.reset(div_23);

					var div_24 = $.sibling(div_23, 2);
					var node_47 = $.child(div_24);

					Badge(node_47, {
						get icon() {
							return Shield;
						},
						size: 'lg',
						variant: 'amber',
						'aria-label': 'icon large amber',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_45 = $.text('amber');

							$.append($$anchor, text_45);
						},
						$$slots: { default: true }
					});

					var node_48 = $.sibling(node_47, 2);

					Badge(node_48, {
						get icon() {
							return Shield;
						},
						size: 'md',
						variant: 'amber',
						'aria-label': 'icon medium amber',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_46 = $.text('amber');

							$.append($$anchor, text_46);
						},
						$$slots: { default: true }
					});

					var node_49 = $.sibling(node_48, 2);

					Badge(node_49, {
						get icon() {
							return Shield;
						},
						size: 'sm',
						variant: 'amber',
						'aria-label': 'icon small amber',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_47 = $.text('amber');

							$.append($$anchor, text_47);
						},
						$$slots: { default: true }
					});

					var node_50 = $.sibling(node_49, 2);

					Badge(node_50, {
						get icon() {
							return Shield;
						},
						size: 'sm',
						variant: 'amber',
						contrast: 'low',
						'aria-label': 'icon small amber-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_48 = $.text('amber');

							$.append($$anchor, text_48);
						},
						$$slots: { default: true }
					});

					var node_51 = $.sibling(node_50, 2);

					Badge(node_51, {
						get icon() {
							return Shield;
						},
						size: 'md',
						variant: 'amber',
						contrast: 'low',
						'aria-label': 'icon medium amber-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_49 = $.text('amber');

							$.append($$anchor, text_49);
						},
						$$slots: { default: true }
					});

					var node_52 = $.sibling(node_51, 2);

					Badge(node_52, {
						get icon() {
							return Shield;
						},
						size: 'lg',
						variant: 'amber',
						contrast: 'low',
						'aria-label': 'icon large amber-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_50 = $.text('amber');

							$.append($$anchor, text_50);
						},
						$$slots: { default: true }
					});

					$.reset(div_24);

					var div_25 = $.sibling(div_24, 2);
					var node_53 = $.child(div_25);

					Badge(node_53, {
						get icon() {
							return Shield;
						},
						size: 'lg',
						variant: 'red',
						'aria-label': 'icon large red',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_51 = $.text('red');

							$.append($$anchor, text_51);
						},
						$$slots: { default: true }
					});

					var node_54 = $.sibling(node_53, 2);

					Badge(node_54, {
						get icon() {
							return Shield;
						},
						size: 'md',
						variant: 'red',
						'aria-label': 'icon medium red',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_52 = $.text('red');

							$.append($$anchor, text_52);
						},
						$$slots: { default: true }
					});

					var node_55 = $.sibling(node_54, 2);

					Badge(node_55, {
						get icon() {
							return Shield;
						},
						size: 'sm',
						variant: 'red',
						'aria-label': 'icon small red',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_53 = $.text('red');

							$.append($$anchor, text_53);
						},
						$$slots: { default: true }
					});

					var node_56 = $.sibling(node_55, 2);

					Badge(node_56, {
						get icon() {
							return Shield;
						},
						size: 'sm',
						variant: 'red',
						contrast: 'low',
						'aria-label': 'icon small red-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_54 = $.text('red');

							$.append($$anchor, text_54);
						},
						$$slots: { default: true }
					});

					var node_57 = $.sibling(node_56, 2);

					Badge(node_57, {
						get icon() {
							return Shield;
						},
						size: 'md',
						variant: 'red',
						contrast: 'low',
						'aria-label': 'icon medium red-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_55 = $.text('red');

							$.append($$anchor, text_55);
						},
						$$slots: { default: true }
					});

					var node_58 = $.sibling(node_57, 2);

					Badge(node_58, {
						get icon() {
							return Shield;
						},
						size: 'lg',
						variant: 'red',
						contrast: 'low',
						'aria-label': 'icon large red-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_56 = $.text('red');

							$.append($$anchor, text_56);
						},
						$$slots: { default: true }
					});

					$.reset(div_25);

					var div_26 = $.sibling(div_25, 2);
					var node_59 = $.child(div_26);

					Badge(node_59, {
						get icon() {
							return Shield;
						},
						size: 'lg',
						variant: 'pink',
						'aria-label': 'icon large pink',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_57 = $.text('pink');

							$.append($$anchor, text_57);
						},
						$$slots: { default: true }
					});

					var node_60 = $.sibling(node_59, 2);

					Badge(node_60, {
						get icon() {
							return Shield;
						},
						size: 'md',
						variant: 'pink',
						'aria-label': 'icon medium pink',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_58 = $.text('pink');

							$.append($$anchor, text_58);
						},
						$$slots: { default: true }
					});

					var node_61 = $.sibling(node_60, 2);

					Badge(node_61, {
						get icon() {
							return Shield;
						},
						size: 'sm',
						variant: 'pink',
						'aria-label': 'icon small pink',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_59 = $.text('pink');

							$.append($$anchor, text_59);
						},
						$$slots: { default: true }
					});

					var node_62 = $.sibling(node_61, 2);

					Badge(node_62, {
						get icon() {
							return Shield;
						},
						size: 'sm',
						variant: 'pink',
						contrast: 'low',
						'aria-label': 'icon small pink-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_60 = $.text('pink');

							$.append($$anchor, text_60);
						},
						$$slots: { default: true }
					});

					var node_63 = $.sibling(node_62, 2);

					Badge(node_63, {
						get icon() {
							return Shield;
						},
						size: 'md',
						variant: 'pink',
						contrast: 'low',
						'aria-label': 'icon medium pink-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_61 = $.text('pink');

							$.append($$anchor, text_61);
						},
						$$slots: { default: true }
					});

					var node_64 = $.sibling(node_63, 2);

					Badge(node_64, {
						get icon() {
							return Shield;
						},
						size: 'lg',
						variant: 'pink',
						contrast: 'low',
						'aria-label': 'icon large pink-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_62 = $.text('pink');

							$.append($$anchor, text_62);
						},
						$$slots: { default: true }
					});

					$.reset(div_26);

					var div_27 = $.sibling(div_26, 2);
					var node_65 = $.child(div_27);

					Badge(node_65, {
						get icon() {
							return Shield;
						},
						size: 'lg',
						variant: 'green',
						'aria-label': 'icon large green',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_63 = $.text('green');

							$.append($$anchor, text_63);
						},
						$$slots: { default: true }
					});

					var node_66 = $.sibling(node_65, 2);

					Badge(node_66, {
						get icon() {
							return Shield;
						},
						size: 'md',
						variant: 'green',
						'aria-label': 'icon medium green',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_64 = $.text('green');

							$.append($$anchor, text_64);
						},
						$$slots: { default: true }
					});

					var node_67 = $.sibling(node_66, 2);

					Badge(node_67, {
						get icon() {
							return Shield;
						},
						size: 'sm',
						variant: 'green',
						'aria-label': 'icon small green',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_65 = $.text('green');

							$.append($$anchor, text_65);
						},
						$$slots: { default: true }
					});

					var node_68 = $.sibling(node_67, 2);

					Badge(node_68, {
						get icon() {
							return Shield;
						},
						size: 'sm',
						variant: 'green',
						contrast: 'low',
						'aria-label': 'icon small green-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_66 = $.text('green');

							$.append($$anchor, text_66);
						},
						$$slots: { default: true }
					});

					var node_69 = $.sibling(node_68, 2);

					Badge(node_69, {
						get icon() {
							return Shield;
						},
						size: 'md',
						variant: 'green',
						contrast: 'low',
						'aria-label': 'icon medium green-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_67 = $.text('green');

							$.append($$anchor, text_67);
						},
						$$slots: { default: true }
					});

					var node_70 = $.sibling(node_69, 2);

					Badge(node_70, {
						get icon() {
							return Shield;
						},
						size: 'lg',
						variant: 'green',
						contrast: 'low',
						'aria-label': 'icon large green-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_68 = $.text('green');

							$.append($$anchor, text_68);
						},
						$$slots: { default: true }
					});

					$.reset(div_27);

					var div_28 = $.sibling(div_27, 2);
					var node_71 = $.child(div_28);

					Badge(node_71, {
						get icon() {
							return Shield;
						},
						size: 'lg',
						variant: 'teal',
						'aria-label': 'icon large teal',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_69 = $.text('teal');

							$.append($$anchor, text_69);
						},
						$$slots: { default: true }
					});

					var node_72 = $.sibling(node_71, 2);

					Badge(node_72, {
						get icon() {
							return Shield;
						},
						size: 'md',
						variant: 'teal',
						'aria-label': 'icon medium teal',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_70 = $.text('teal');

							$.append($$anchor, text_70);
						},
						$$slots: { default: true }
					});

					var node_73 = $.sibling(node_72, 2);

					Badge(node_73, {
						get icon() {
							return Shield;
						},
						size: 'sm',
						variant: 'teal',
						'aria-label': 'icon small teal',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_71 = $.text('teal');

							$.append($$anchor, text_71);
						},
						$$slots: { default: true }
					});

					var node_74 = $.sibling(node_73, 2);

					Badge(node_74, {
						get icon() {
							return Shield;
						},
						size: 'sm',
						variant: 'teal',
						contrast: 'low',
						'aria-label': 'icon small teal-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_72 = $.text('teal');

							$.append($$anchor, text_72);
						},
						$$slots: { default: true }
					});

					var node_75 = $.sibling(node_74, 2);

					Badge(node_75, {
						get icon() {
							return Shield;
						},
						size: 'md',
						variant: 'teal',
						contrast: 'low',
						'aria-label': 'icon medium teal-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_73 = $.text('teal');

							$.append($$anchor, text_73);
						},
						$$slots: { default: true }
					});

					var node_76 = $.sibling(node_75, 2);

					Badge(node_76, {
						get icon() {
							return Shield;
						},
						size: 'lg',
						variant: 'teal',
						contrast: 'low',
						'aria-label': 'icon large teal-subtle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_74 = $.text('teal');

							$.append($$anchor, text_74);
						},
						$$slots: { default: true }
					});

					$.reset(div_28);

					var div_29 = $.sibling(div_28, 2);
					var node_77 = $.child(div_29);

					Badge(node_77, {
						get icon() {
							return Shield;
						},
						size: 'lg',
						variant: 'inverted',
						'aria-label': 'icon large inverted',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_75 = $.text('inverted');

							$.append($$anchor, text_75);
						},
						$$slots: { default: true }
					});

					var node_78 = $.sibling(node_77, 2);

					Badge(node_78, {
						get icon() {
							return Shield;
						},
						size: 'md',
						variant: 'inverted',
						'aria-label': 'icon medium inverted',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_76 = $.text('inverted');

							$.append($$anchor, text_76);
						},
						$$slots: { default: true }
					});

					var node_79 = $.sibling(node_78, 2);

					Badge(node_79, {
						get icon() {
							return Shield;
						},
						size: 'sm',
						variant: 'inverted',
						'aria-label': 'icon small inverted',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_77 = $.text('inverted');

							$.append($$anchor, text_77);
						},
						$$slots: { default: true }
					});

					$.reset(div_29);
					$.reset(div_20);
					$.append($$anchor, div_20);
				};

				var node_80 = $.child(div_19);

				demoAndCode(node_80, () => demo, () => badgeWithIcon);
				$.reset(div_19);
			}

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});
};

const pill = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root_7();
			var node_81 = $.first_child(fragment_9);

			LinkH2(node_81, {
				href: '/badge#pill',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_78 = $.text('Pill');

					$.append($$anchor, text_78);
				},
				$$slots: { default: true }
			});

			var p_1 = $.sibling(node_81, 2);
			var node_82 = $.sibling($.child(p_1));

			roundedCode(node_82, () => "<Badge />");
			$.next();
			$.reset(p_1);

			var div_30 = $.sibling(p_1, 2);

			{
				const demo = ($$anchor) => {
					var div_31 = root_6();
					var div_32 = $.child(div_31);
					var node_83 = $.child(div_32);

					Badge(node_83, {
						href: '/badge#pill',
						size: 'sm',
						variant: 'pill',
						'aria-label': 'large pill',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_79 = $.text('label');

							$.append($$anchor, text_79);
						},
						$$slots: { default: true }
					});

					var node_84 = $.sibling(node_83, 2);

					Badge(node_84, {
						href: '/badge#pill',
						size: 'md',
						variant: 'pill',
						'aria-label': 'medium pill',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_80 = $.text('label');

							$.append($$anchor, text_80);
						},
						$$slots: { default: true }
					});

					var node_85 = $.sibling(node_84, 2);

					Badge(node_85, {
						href: '/badge#pill',
						size: 'lg',
						variant: 'pill',
						'aria-label': 'small pill',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_81 = $.text('label');

							$.append($$anchor, text_81);
						},
						$$slots: { default: true }
					});

					$.reset(div_32);

					var div_33 = $.sibling(div_32, 2);
					var node_86 = $.child(div_33);

					Badge(node_86, {
						href: '/badge#pill',
						get icon() {
							return ExternalLink;
						},
						size: 'sm',
						variant: 'pill',
						'aria-label': 'icon large pill',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_82 = $.text('label');

							$.append($$anchor, text_82);
						},
						$$slots: { default: true }
					});

					var node_87 = $.sibling(node_86, 2);

					Badge(node_87, {
						href: '/badge#pill',
						get icon() {
							return ExternalLink;
						},
						size: 'md',
						variant: 'pill',
						'aria-label': 'icon medium pill',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_83 = $.text('label');

							$.append($$anchor, text_83);
						},
						$$slots: { default: true }
					});

					var node_88 = $.sibling(node_87, 2);

					Badge(node_88, {
						href: '/badge#pill',
						get icon() {
							return ExternalLink;
						},
						size: 'lg',
						variant: 'pill',
						'aria-label': 'icon small pill',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_84 = $.text('label');

							$.append($$anchor, text_84);
						},
						$$slots: { default: true }
					});

					$.reset(div_33);
					$.reset(div_31);
					$.append($$anchor, div_31);
				};

				var node_89 = $.child(div_30);

				demoAndCode(node_89, () => demo, () => badgePill);
				$.reset(div_30);
			}

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});
};

const roundedCode = ($$anchor, rct = $.noop) => {
	var code_1 = root_8();
	var text_85 = $.only_child(code_1, true);

	$.template_effect(() => $.set_text(text_85, rct()));
	$.append($$anchor, code_1);
};

const bestPractices = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_11 = root_9();
			var node_90 = $.first_child(fragment_11);

			LinkH2(node_90, {
				href: '/badge#best-practices',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_86 = $.text('Best Practices');

					$.append($$anchor, text_86);
				},
				$$slots: { default: true }
			});

			var ul = $.sibling(node_90, 2);
			var li = $.sibling($.child(ul), 2);
			var node_91 = $.sibling($.child(li));

			roundedCode(node_91, () => "StatusDot");

			var node_92 = $.sibling(node_91, 2);

			roundedCode(node_92, () => "pill");

			var node_93 = $.sibling(node_92, 2);

			roundedCode(node_93, () => "Button");
			$.next();
			$.reset(li);

			var li_1 = $.sibling(li, 2);
			var node_94 = $.sibling($.child(li_1));

			roundedCode(node_94, () => "on:click");

			var node_95 = $.sibling(node_94, 2);

			roundedCode(node_95, () => "Button");
			$.next();
			$.reset(li_1);

			var li_2 = $.sibling(li_1, 2);
			var node_96 = $.sibling($.child(li_2));

			roundedCode(node_96, () => "icon");
			$.next();
			$.reset(li_2);

			var li_3 = $.sibling(li_2, 2);
			var node_97 = $.sibling($.child(li_3));

			roundedCode(node_97, () => "Alpha");

			var node_98 = $.sibling(node_97, 2);

			roundedCode(node_98, () => "Beta");

			var node_99 = $.sibling(node_98, 2);

			roundedCode(node_99, () => "Early Access");

			var node_100 = $.sibling(node_99, 2);

			roundedCode(node_100, () => "Tooltip");

			var node_101 = $.sibling(node_100, 2);

			roundedCode(node_101, () => "Alpha: API may change before GA");
			$.next();
			$.reset(li_3);

			var li_4 = $.sibling(li_3, 2);
			var node_102 = $.sibling($.child(li_4));

			roundedCode(node_102, () => "Active");

			var node_103 = $.sibling(node_102, 2);

			roundedCode(node_103, () => "Pending");

			var node_104 = $.sibling(node_103, 2);

			roundedCode(node_104, () => "Pro");

			var node_105 = $.sibling(node_104, 2);

			roundedCode(node_105, () => "Enterprise Trial");

			var node_106 = $.sibling(node_105, 2);

			roundedCode(node_106, () => "Production");

			var node_107 = $.sibling(node_106, 2);

			roundedCode(node_107, () => "Prod");

			var node_108 = $.sibling(node_107, 2);

			roundedCode(node_108, () => "Deployed");

			var node_109 = $.sibling(node_108, 2);

			roundedCode(node_109, () => "Live");

			var node_110 = $.sibling(node_109, 2);

			roundedCode(node_110, () => "Canceled");

			var node_111 = $.sibling(node_110, 2);

			roundedCode(node_111, () => "Cancelled");
			$.next();
			$.reset(li_4);

			var li_5 = $.sibling(li_4, 2);
			var node_112 = $.sibling($.child(li_5));

			roundedCode(node_112, () => "green");

			var node_113 = $.sibling(node_112, 2);

			roundedCode(node_113, () => "red");

			var node_114 = $.sibling(node_113, 2);

			roundedCode(node_114, () => "amber");

			var node_115 = $.sibling(node_114, 2);

			roundedCode(node_115, () => "blue");

			var node_116 = $.sibling(node_115, 2);

			roundedCode(node_116, () => "gray");

			var node_117 = $.sibling(node_116, 2);

			roundedCode(node_117, () => 'contrast="low"');
			$.next();
			$.reset(li_5);

			var li_6 = $.sibling(li_5, 2);
			var node_118 = $.sibling($.child(li_6));

			roundedCode(node_118, () => "Currently Active");

			var node_119 = $.sibling(node_118, 2);

			roundedCode(node_119, () => "You are on Pro");
			$.next();
			$.reset(li_6);

			var li_7 = $.sibling(li_6, 2);
			var node_120 = $.sibling($.child(li_7));

			roundedCode(node_120, () => "title");
			$.next();
			$.reset(li_7);
			$.reset(ul);
			$.append($$anchor, fragment_11);
		},
		$$slots: { default: true }
	});
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "avatar", href: "/avatar" },
				next: { title: "button", href: "/button" }
			});
		},
		$$slots: { default: true }
	});
};

const aside = ($$anchor) => {
	Aside($$anchor, {
		get asideDataList() {
			return asideData;
		}
	});
};

var root = $.from_html(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]"> </h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]"> </p>`, 1);
var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border"><div class="w-full overflow-x-auto p-4 lg:p-6"><div class="flex w-full flex-wrap justify-between gap-4"><!></div></div> <!></div>`);
var root_2 = $.from_html(`<div class="flex flex-col gap-2"><div class="flex gap-1 capitalize"><!> <!></div> <div class="flex gap-1 capitalize"><!> <!></div> <div class="flex gap-1 capitalize"><!> <!></div> <div class="flex gap-1 capitalize"><!> <!></div> <div class="flex gap-1 capitalize"><!> <!></div> <div class="flex gap-1 capitalize"><!> <!></div> <div class="flex gap-1 capitalize"><!> <!></div> <div class="flex gap-1 capitalize"><!> <!></div> <div class="flex gap-1 capitalize"><!> <!> <!></div></div>`);
var root_3 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_4 = $.from_html(`<div class="flex items-center gap-2"><div class="flex gap-1 capitalize"><!></div> <div class="flex gap-1 capitalize"><!></div> <div class="flex gap-1 capitalize"><!></div></div>`);
var root_5 = $.from_html(`<div class="flex flex-col gap-2"><div class="flex items-center gap-1 capitalize"><!> <!> <!> <!> <!> <!></div> <div class="flex items-center gap-1 capitalize"><!> <!> <!> <!> <!> <!></div> <div class="flex items-center gap-1 capitalize"><!> <!> <!> <!> <!> <!></div> <div class="flex items-center gap-1 capitalize"><!> <!> <!> <!> <!> <!></div> <div class="flex items-center gap-1 capitalize"><!> <!> <!> <!> <!> <!></div> <div class="flex items-center gap-1 capitalize"><!> <!> <!> <!> <!> <!></div> <div class="flex items-center gap-1 capitalize"><!> <!> <!> <!> <!> <!></div> <div class="flex items-center gap-1 capitalize"><!> <!> <!> <!> <!> <!></div> <div class="flex items-center gap-1 capitalize"><!> <!> <!></div></div>`);
var root_6 = $.from_html(`<div class="flex flex-col gap-4"><div class="flex items-center gap-2 capitalize"><!> <!> <!></div> <div class="flex items-center gap-2 capitalize"><!> <!> <!></div></div>`);
var root_7 = $.from_html(`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">A special link, not quite as prominent as a button, based on <!> styling.</p> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_8 = $.from_html(`<code class="text-kui-light-gray-900 bg-kui-light-gray-100 dark:bg-kui-dark-gray-100 dark:text-kui-dark-gray-900 border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-md border px-2 py-[3.6px] text-xs"> </code>`);

var root_9 = $.from_html(
	`<!> <ul class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-4 list-disc space-y-2 pl-5 text-[14px] leading-6 md:text-[16px] xl:mt-7"><li>Use Badge for short, scannable metadata that sits next to the thing it describes:
				status, plan tier, environment, or role. One badge per row; two side by side is a sign
				the row needs a second column.</li> <li>For a colored dot without text, use <!>. For clickable
				filter chips that toggle a query, use the <!> variant or a small <!>.</li> <li>Badges are static labels. Don’t wire <!> onto them; promote
				to a <!> or link if the user can act on the value.</li> <li>Keep badge content to text or <!> + text. Never stack two icons
				or a child Badge inside a Badge.</li> <li>Pair lifecycle badges (<!>, <!>, <!>) with a <!> that names
				the limit, like <!>.</li> <li>Title Case, one word when possible, two max: <!>, <!>, <!>, <!>. Match the canonical API or log term: <!> not <!>, <!> not <!>, <!> not <!> (the Vercel API
				uses one L).</li> <li>Don’t add a checkmark icon for success states or an X for errors; the variant carries
				that signal. Map meaning to color: <!> for healthy, <!> for error, <!> for warning, <!> for informational or production, <!> for neutral. Use <!> to tone any of them down on dense
				surfaces.</li> <li>Skip stuffing sentences inside (<!>, <!>); the surrounding row supplies the context.</li> <li>Set <!> for icon-only or ambiguous badges so screen readers announce
				the meaning. Don’t rely on color alone; the text has to be readable without it.</li></ul>`,
	1
);

var root_10 = $.from_html(`<!> <section><!> <!> <!> <!> <!></section> <!>`, 1);

export default function _page($$anchor) {
	const cont = ($$anchor) => {
		var fragment_14 = root_10();
		var node_121 = $.first_child(fragment_14);

		badge(node_121, () => contHeading.title, () => contHeading.para);

		var section = $.sibling(node_121, 2);
		var node_122 = $.child(section);

		variants(node_122);

		var node_123 = $.sibling(node_122, 2);

		size(node_123);

		var node_124 = $.sibling(node_123, 2);

		icons(node_124);

		var node_125 = $.sibling(node_124, 2);

		pill(node_125);

		var node_126 = $.sibling(node_125, 2);

		bestPractices(node_126);
		$.reset(section);

		var node_127 = $.sibling(section, 2);

		prevAndNext(node_127);
		$.append($$anchor, fragment_14);
	};

	const contHeading = {
		title: "badge",
		para: `A label that emphasizes an element that requires attention, or helps categorize with other
			similar elements.`
	};

	$.head('iy2a3g', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Badge';
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