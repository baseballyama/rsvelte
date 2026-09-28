import * as $ from 'svelte/internal/server';
import { SegmentedControl } from '@skeletonlabs/skeleton-svelte';
import { scrollY } from 'svelte/reactivity/window';

function useActiveHeading(headings) {
	let activeHeading = void 0;

	return () => activeHeading;
}

export default function Table_of_contents($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { headings } = $$props;
		const activeHeading = $.derived(() => useActiveHeading(headings));
		const scrollTop = $.derived(() => scrollY.current ?? 0);

		function getPaddingFromDepth(depth) {
			return ({
				1: 'ps-0',
				2: 'ps-4',
				3: 'ps-8',
				4: 'ps-12',
				5: 'ps-16',
				6: 'ps-20'
			})[depth];
		}

		if (headings.length > 0) {
			$$renderer.push(`<!--[0--><nav class="flex flex-col gap-4"><span class="font-bold flex items-center gap-2">On This Page</span> `);

			SegmentedControl($$renderer, {
				value: scrollTop() > 32 ? activeHeading()()?.slug : undefined,
				orientation: 'vertical',
				class: '-ml-4',
				children: ($$renderer) => {
					if (SegmentedControl.Control) {
						$$renderer.push('<!--[-->');

						SegmentedControl.Control($$renderer, {
							class: 'border-none p-0',
							children: ($$renderer) => {
								if (SegmentedControl.Indicator) {
									$$renderer.push('<!--[-->');
									SegmentedControl.Indicator($$renderer, { class: 'w-0.5' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` <!--[-->`);

								const each_array = $.ensure_array_like(headings);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let heading = each_array[$$index];

									{
										function element($$renderer, attributes) {
											$$renderer.push(`<a${$.attributes({ ...attributes, href: `#${heading.slug}` })}>`);

											if (SegmentedControl.ItemText) {
												$$renderer.push('<!--[-->');

												SegmentedControl.ItemText($$renderer, {
													class: 'text-sm text-surface-contrast-50-950/50 data-[state=checked]:text-surface-contrast-50-950 text-wrap',
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(heading.text)}`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (SegmentedControl.ItemHiddenInput) {
												$$renderer.push('<!--[-->');
												SegmentedControl.ItemHiddenInput($$renderer, {});
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(`</a>`);
										}

										if (SegmentedControl.Item) {
											$$renderer.push('<!--[-->');

											SegmentedControl.Item($$renderer, {
												value: heading.slug,
												class: `justify-start p-0 ${$.stringify(getPaddingFromDepth(heading.depth))}`,
												element,
												$$slots: { element: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}
								}

								$$renderer.push(`<!--]-->`);
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

			$$renderer.push(`<!----></nav>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}