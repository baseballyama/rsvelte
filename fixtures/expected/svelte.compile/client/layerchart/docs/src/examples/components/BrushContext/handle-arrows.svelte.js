import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Area, Chart, Layer } from 'layerchart';
import { cls } from '@layerstack/tailwind';
import LucideChevronLeft from '~icons/lucide/chevron-left';
import LucideChevronRight from '~icons/lucide/chevron-right';

const data = await getAppleStock();
var root = $.from_svg(`<rect></rect><!><rect></rect><!>`, 1);
var root_1 = $.from_svg(`<!><!>`, 1);

export default function Handle_arrows($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node = $.first_child(fragment_2);

					Area(node, {
						line: { class: 'stroke-2 stroke-primary' },
						class: 'fill-primary/20'
					});

					var node_1 = $.sibling(node);

					{
						var consequent = ($$anchor) => {
							var fragment_3 = root();
							var rect = $.first_child(fragment_3);
							var node_2 = $.sibling(rect);

							{
								let $0 = $.derived(() => context().brush.range.x - 6);
								let $1 = $.derived(() => context().brush.range.height / 2 - 10);

								LucideChevronLeft(node_2, {
									get x() {
										return $.get($0);
									},

									get y() {
										return $.get($1);
									},
									class: 'fill-secondary-content'
								});
							}

							var rect_1 = $.sibling(node_2);
							var node_3 = $.sibling(rect_1);

							{
								let $0 = $.derived(() => context().brush.range.x + context().brush.range.width - context().brush.handleSize - 6);
								let $1 = $.derived(() => context().brush.range.height / 2 - 10);

								LucideChevronRight(node_3, {
									get x() {
										return $.get($0);
									},

									get y() {
										return $.get($1);
									},
									class: 'fill-secondary-content'
								});
							}

							$.template_effect(
								($0, $1) => {
									$.set_attribute(rect, 'x', context().brush.range.x);
									$.set_attribute(rect, 'width', context().brush.handleSize);
									$.set_attribute(rect, 'height', context().brush.range.height);
									$.set_class(rect, 0, $0);
									$.set_attribute(rect_1, 'x', context().brush.range.x + context().brush.range.width - context().brush.handleSize);
									$.set_attribute(rect_1, 'width', context().brush.handleSize);
									$.set_attribute(rect_1, 'height', context().brush.range.height);
									$.set_class(rect_1, 0, $1);
								},
								[
									() => $.clsx(cls('fill-secondary cursor-ew-resize select-none')),
									() => $.clsx(cls('fill-secondary cursor-ew-resize select-none'))
								]
							);

							$.append($$anchor, fragment_3);
						};

						$.if(node_1, ($$render) => {
							if (context().brush.active) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			brush: { classes: { range: 'bg-secondary/10' }, handleSize: 8 },
			height: 40,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}