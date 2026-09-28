import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SegmentedControl } from '@skeletonlabs/skeleton-svelte';
import { scrollY } from 'svelte/reactivity/window';

function useActiveHeading(headings) {
	let activeHeading = $.state(void 0);

	$.user_effect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const id = `#${entry.target.getAttribute('id')}`;
					const heading = headings.find((heading) => `#${heading.slug}` === id);

					if (entry?.isIntersecting) {
						$.set(activeHeading, heading, true);
					}
				}
			},
			{ rootMargin: '0px 0px -85% 0px' }
		);

		for (const element of headings.map((heading) => document.getElementById(heading.slug)).filter((element) => element !== null)) {
			observer.observe(element);
		}

		return () => observer.disconnect();
	});

	return () => $.get(activeHeading);
}

var root = $.from_html(`<a><!> <!></a>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<nav class="flex flex-col gap-4"><span class="font-bold flex items-center gap-2">On This Page</span> <!></nav>`);

export default function Table_of_contents($$anchor, $$props) {
	$.push($$props, true);

	const activeHeading = $.derived(() => useActiveHeading($$props.headings));
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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var nav = root_2();
			var node_1 = $.sibling($.child(nav), 2);

			{
				let $0 = $.derived(() => $.get(scrollTop) > 32 ? $.get(activeHeading)()?.slug : undefined);

				SegmentedControl(node_1, {
					get value() {
						return $.get($0);
					},
					orientation: 'vertical',
					class: '-ml-4',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => SegmentedControl.Control, ($$anchor, SegmentedControl_Control) => {
							SegmentedControl_Control($$anchor, {
								class: 'border-none p-0',
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root_1();
									var node_3 = $.first_child(fragment_2);

									$.component(node_3, () => SegmentedControl.Indicator, ($$anchor, SegmentedControl_Indicator) => {
										SegmentedControl_Indicator($$anchor, { class: 'w-0.5' });
									});

									var node_4 = $.sibling(node_3, 2);

									$.each(node_4, 16, () => $$props.headings, (heading) => heading, ($$anchor, heading) => {
										var fragment_3 = $.comment();
										var node_5 = $.first_child(fragment_3);

										{
											const element = ($$anchor, attributes = $.noop) => {
												var a = root();

												$.attribute_effect(a, () => ({ ...attributes(), href: `#${heading.slug}` }));

												var node_6 = $.child(a);

												$.component(node_6, () => SegmentedControl.ItemText, ($$anchor, SegmentedControl_ItemText) => {
													SegmentedControl_ItemText($$anchor, {
														class: 'text-sm text-surface-contrast-50-950/50 data-[state=checked]:text-surface-contrast-50-950 text-wrap',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text();

															$.template_effect(() => $.set_text(text, heading.text));
															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});

												var node_7 = $.sibling(node_6, 2);

												$.component(node_7, () => SegmentedControl.ItemHiddenInput, ($$anchor, SegmentedControl_ItemHiddenInput) => {
													SegmentedControl_ItemHiddenInput($$anchor, {});
												});

												$.reset(a);
												$.append($$anchor, a);
											};

											let $0 = $.derived(() => getPaddingFromDepth(heading.depth));

											$.component(node_5, () => SegmentedControl.Item, ($$anchor, SegmentedControl_Item) => {
												SegmentedControl_Item($$anchor, {
													get value() {
														return heading.slug;
													},

													get class() {
														return `justify-start p-0 ${$.get($0) ?? ''}`;
													},
													element,
													$$slots: { element: true }
												});
											});
										}

										$.append($$anchor, fragment_3);
									});

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			}

			$.reset(nav);
			$.append($$anchor, nav);
		};

		$.if(node, ($$render) => {
			if ($$props.headings.length > 0) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}