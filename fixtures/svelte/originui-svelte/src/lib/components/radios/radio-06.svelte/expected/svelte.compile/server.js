import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';
import IconStarFill from '~icons/ri/star-fill';

export default function Radio_06($$renderer) {
	let selectedValue = 'all';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		RadioGroup($$renderer, {
			get value() {
				return selectedValue;
			},

			set value($$value) {
				selectedValue = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<div class="flex items-center gap-2">`);
				RadioGroupItem($$renderer, { value: 'all', id: 'radio-06-all' });
				$$renderer.push(`<!----> `);

				Label($$renderer, {
					for: 'radio-06-all',
					children: ($$renderer) => {
						$$renderer.push(`<!---->All reviews <span class="text-muted-foreground text-xs leading-[inherit] font-normal">(12,921)</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex items-center gap-2">`);
				RadioGroupItem($$renderer, { value: '5-stars', id: 'radio-06-5-stars' });
				$$renderer.push(`<!----> `);

				Label($$renderer, {
					for: 'radio-06-5-stars',
					class: 'inline-flex items-center gap-1',
					children: ($$renderer) => {
						$$renderer.push(`<span class="inline-flex items-center text-amber-500" aria-hidden="true"><!--[-->`);

						const each_array = $.ensure_array_like(Array.from({ length: 5 }));

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							IconStarFill($$renderer, { width: '16', height: '16', 'aria-hidden': 'true' });
						}

						$$renderer.push(`<!--]--></span> <span class="sr-only">5 stars</span> <span class="text-muted-foreground text-xs leading-[inherit] font-normal">(5,168)</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex items-center gap-2">`);
				RadioGroupItem($$renderer, { value: '4-stars', id: 'radio-06-4-stars' });
				$$renderer.push(`<!----> `);

				Label($$renderer, {
					for: 'radio-06-4-stars',
					class: 'inline-flex items-center gap-1',
					children: ($$renderer) => {
						$$renderer.push(`<span class="inline-flex items-center text-amber-500" aria-hidden="true"><!--[-->`);

						const each_array_1 = $.ensure_array_like(Array.from({ length: 4 }));

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							IconStarFill($$renderer, { width: '16', height: '16', 'aria-hidden': 'true' });
						}

						$$renderer.push(`<!--]--> `);

						IconStarFill($$renderer, {
							width: '16',
							height: '16',
							'aria-hidden': 'true',
							class: 'opacity-30'
						});

						$$renderer.push(`<!----></span> <span class="sr-only">4 stars</span> <span class="text-muted-foreground text-xs leading-[inherit] font-normal">(4,726)</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex items-center gap-2">`);
				RadioGroupItem($$renderer, { value: '3-stars', id: 'radio-06-3-stars' });
				$$renderer.push(`<!----> `);

				Label($$renderer, {
					for: 'radio-06-3-stars',
					class: 'inline-flex items-center gap-1',
					children: ($$renderer) => {
						$$renderer.push(`<span class="inline-flex items-center text-amber-500" aria-hidden="true"><!--[-->`);

						const each_array_2 = $.ensure_array_like(Array.from({ length: 3 }));

						for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
							IconStarFill($$renderer, { width: '16', height: '16', 'aria-hidden': 'true' });
						}

						$$renderer.push(`<!--]--> <!--[-->`);

						const each_array_3 = $.ensure_array_like(Array.from({ length: 2 }));

						for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
							IconStarFill($$renderer, {
								width: '16',
								height: '16',
								'aria-hidden': 'true',
								class: 'opacity-30'
							});
						}

						$$renderer.push(`<!--]--></span> <span class="sr-only">3 stars</span> <span class="text-muted-foreground text-xs leading-[inherit] font-normal">(3,234)</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex items-center gap-2">`);
				RadioGroupItem($$renderer, { value: '2-stars', id: 'radio-06-2-stars' });
				$$renderer.push(`<!----> `);

				Label($$renderer, {
					for: 'radio-06-2-stars',
					class: 'inline-flex items-center gap-1',
					children: ($$renderer) => {
						$$renderer.push(`<span class="inline-flex items-center text-amber-500" aria-hidden="true"><!--[-->`);

						const each_array_4 = $.ensure_array_like(Array.from({ length: 2 }));

						for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
							IconStarFill($$renderer, { width: '16', height: '16', 'aria-hidden': 'true' });
						}

						$$renderer.push(`<!--]--> <!--[-->`);

						const each_array_5 = $.ensure_array_like(Array.from({ length: 3 }));

						for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
							IconStarFill($$renderer, {
								width: '16',
								height: '16',
								'aria-hidden': 'true',
								class: 'opacity-30'
							});
						}

						$$renderer.push(`<!--]--></span> <span class="sr-only">2 stars</span> <span class="text-muted-foreground text-xs leading-[inherit] font-normal">(1,842)</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex items-center gap-2">`);
				RadioGroupItem($$renderer, { value: '1-star', id: 'radio-06-1-star' });
				$$renderer.push(`<!----> `);

				Label($$renderer, {
					for: 'radio-06-1-star',
					class: 'inline-flex items-center gap-1',
					children: ($$renderer) => {
						$$renderer.push(`<span class="inline-flex items-center text-amber-500" aria-hidden="true">`);
						IconStarFill($$renderer, { width: '16', height: '16', 'aria-hidden': 'true' });
						$$renderer.push(`<!----> <!--[-->`);

						const each_array_6 = $.ensure_array_like(Array.from({ length: 4 }));

						for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
							IconStarFill($$renderer, {
								width: '16',
								height: '16',
								'aria-hidden': 'true',
								class: 'opacity-30'
							});
						}

						$$renderer.push(`<!--]--></span> <span class="sr-only">1 star</span> <span class="text-muted-foreground text-xs leading-[inherit] font-normal">(452)</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}