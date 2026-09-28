import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';
import IconStarFill from '~icons/ri/star-fill';

var root = $.from_html(`All reviews <span class="text-muted-foreground text-xs leading-[inherit] font-normal">(12,921)</span>`, 1);
var root_1 = $.from_html(`<span class="inline-flex items-center text-amber-500" aria-hidden="true"></span> <span class="sr-only">5 stars</span> <span class="text-muted-foreground text-xs leading-[inherit] font-normal">(5,168)</span>`, 1);
var root_2 = $.from_html(`<span class="inline-flex items-center text-amber-500" aria-hidden="true"><!> <!></span> <span class="sr-only">4 stars</span> <span class="text-muted-foreground text-xs leading-[inherit] font-normal">(4,726)</span>`, 1);
var root_3 = $.from_html(`<span class="inline-flex items-center text-amber-500" aria-hidden="true"><!> <!></span> <span class="sr-only">3 stars</span> <span class="text-muted-foreground text-xs leading-[inherit] font-normal">(3,234)</span>`, 1);
var root_4 = $.from_html(`<span class="inline-flex items-center text-amber-500" aria-hidden="true"><!> <!></span> <span class="sr-only">2 stars</span> <span class="text-muted-foreground text-xs leading-[inherit] font-normal">(1,842)</span>`, 1);
var root_5 = $.from_html(`<span class="inline-flex items-center text-amber-500" aria-hidden="true"><!> <!></span> <span class="sr-only">1 star</span> <span class="text-muted-foreground text-xs leading-[inherit] font-normal">(452)</span>`, 1);
var root_6 = $.from_html(`<div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div>`, 1);

export default function Radio_06($$anchor) {
	let selectedValue = $.state('all');

	RadioGroup($$anchor, {
		get value() {
			return $.get(selectedValue);
		},

		set value($$value) {
			$.set(selectedValue, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_6();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			RadioGroupItem(node, { value: 'all', id: 'radio-06-all' });

			var node_1 = $.sibling(node, 2);

			Label(node_1, {
				for: 'radio-06-all',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root();

					$.next();
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var node_2 = $.child(div_1);

			RadioGroupItem(node_2, { value: '5-stars', id: 'radio-06-5-stars' });

			var node_3 = $.sibling(node_2, 2);

			Label(node_3, {
				for: 'radio-06-5-stars',
				class: 'inline-flex items-center gap-1',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var span = $.first_child(fragment_3);

					$.each(span, 20, () => Array.from({ length: 5 }), $.index, ($$anchor, $$item) => {
						IconStarFill($$anchor, { width: '16', height: '16', 'aria-hidden': 'true' });
					});

					$.reset(span);
					$.next(4);
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_4 = $.child(div_2);

			RadioGroupItem(node_4, { value: '4-stars', id: 'radio-06-4-stars' });

			var node_5 = $.sibling(node_4, 2);

			Label(node_5, {
				for: 'radio-06-4-stars',
				class: 'inline-flex items-center gap-1',
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_2();
					var span_1 = $.first_child(fragment_5);
					var node_6 = $.child(span_1);

					$.each(node_6, 16, () => Array.from({ length: 4 }), $.index, ($$anchor, $$item) => {
						IconStarFill($$anchor, { width: '16', height: '16', 'aria-hidden': 'true' });
					});

					var node_7 = $.sibling(node_6, 2);

					IconStarFill(node_7, {
						width: '16',
						height: '16',
						'aria-hidden': 'true',
						class: 'opacity-30'
					});

					$.reset(span_1);
					$.next(4);
					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var node_8 = $.child(div_3);

			RadioGroupItem(node_8, { value: '3-stars', id: 'radio-06-3-stars' });

			var node_9 = $.sibling(node_8, 2);

			Label(node_9, {
				for: 'radio-06-3-stars',
				class: 'inline-flex items-center gap-1',
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_3();
					var span_2 = $.first_child(fragment_7);
					var node_10 = $.child(span_2);

					$.each(node_10, 16, () => Array.from({ length: 3 }), $.index, ($$anchor, $$item) => {
						IconStarFill($$anchor, { width: '16', height: '16', 'aria-hidden': 'true' });
					});

					var node_11 = $.sibling(node_10, 2);

					$.each(node_11, 16, () => Array.from({ length: 2 }), $.index, ($$anchor, $$item) => {
						IconStarFill($$anchor, {
							width: '16',
							height: '16',
							'aria-hidden': 'true',
							class: 'opacity-30'
						});
					});

					$.reset(span_2);
					$.next(4);
					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var node_12 = $.child(div_4);

			RadioGroupItem(node_12, { value: '2-stars', id: 'radio-06-2-stars' });

			var node_13 = $.sibling(node_12, 2);

			Label(node_13, {
				for: 'radio-06-2-stars',
				class: 'inline-flex items-center gap-1',
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root_4();
					var span_3 = $.first_child(fragment_10);
					var node_14 = $.child(span_3);

					$.each(node_14, 16, () => Array.from({ length: 2 }), $.index, ($$anchor, $$item) => {
						IconStarFill($$anchor, { width: '16', height: '16', 'aria-hidden': 'true' });
					});

					var node_15 = $.sibling(node_14, 2);

					$.each(node_15, 16, () => Array.from({ length: 3 }), $.index, ($$anchor, $$item) => {
						IconStarFill($$anchor, {
							width: '16',
							height: '16',
							'aria-hidden': 'true',
							class: 'opacity-30'
						});
					});

					$.reset(span_3);
					$.next(4);
					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});

			$.reset(div_4);

			var div_5 = $.sibling(div_4, 2);
			var node_16 = $.child(div_5);

			RadioGroupItem(node_16, { value: '1-star', id: 'radio-06-1-star' });

			var node_17 = $.sibling(node_16, 2);

			Label(node_17, {
				for: 'radio-06-1-star',
				class: 'inline-flex items-center gap-1',
				children: ($$anchor, $$slotProps) => {
					var fragment_13 = root_5();
					var span_4 = $.first_child(fragment_13);
					var node_18 = $.child(span_4);

					IconStarFill(node_18, { width: '16', height: '16', 'aria-hidden': 'true' });

					var node_19 = $.sibling(node_18, 2);

					$.each(node_19, 16, () => Array.from({ length: 4 }), $.index, ($$anchor, $$item) => {
						IconStarFill($$anchor, {
							width: '16',
							height: '16',
							'aria-hidden': 'true',
							class: 'opacity-30'
						});
					});

					$.reset(span_4);
					$.next(4);
					$.append($$anchor, fragment_13);
				},
				$$slots: { default: true }
			});

			$.reset(div_5);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}