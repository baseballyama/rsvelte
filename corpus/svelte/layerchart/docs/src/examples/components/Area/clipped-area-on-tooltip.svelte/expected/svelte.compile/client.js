import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';

import {
	Area,
	Axis,
	Chart,
	Highlight,
	Layer,
	LinearGradient,
	RectClipPath,
	Tooltip
} from 'layerchart';

import { format } from '@layerstack/utils';

const data = await getAppleStock();
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Clipped_area_on_tooltip($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			Layer(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_1 = $.first_child(fragment_2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;
							var fragment_3 = root();
							var node_2 = $.first_child(fragment_3);

							Area(node_2, {
								line: { class: 'stroke-2 stroke-primary opacity-20' },
								get fill() {
									return gradient();
								}
							});

							var node_3 = $.sibling(node_2, 2);

							{
								let $0 = $.derived(() => context().tooltip.data ? context().tooltip.x : context().width);

								RectClipPath(node_3, {
									x: 0,
									y: 0,
									get width() {
										return $.get($0);
									},

									get height() {
										return context().height;
									},
									motion: 'spring',
									children: ($$anchor, $$slotProps) => {
										Area($$anchor, {
											line: { class: 'stroke-2 stroke-primary' },
											get fill() {
												return gradient();
											}
										});
									},
									$$slots: { default: true }
								});
							}

							$.append($$anchor, fragment_3);
						};

						LinearGradient(node_1, {
							class: 'from-primary/50 to-primary/1',
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}

					var node_4 = $.sibling(node_1, 2);

					Highlight(node_4, {
						points: true,
						lines: { class: 'stroke-primary [stroke-dasharray:unset]' }
					});

					var node_5 = $.sibling(node_4, 2);

					Axis(node_5, { placement: 'bottom' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;

					$.next();

					var text = $.text();

					$.template_effect(($0) => $.set_text(text, $0), [() => format(data().value, 'currency')]);
					$.append($$anchor, text);
				};

				$.component(node_6, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						y: 24,
						xOffset: 4,
						variant: 'none',
						class: 'text-sm font-semibold text-primary leading-3',
						children,
						$$slots: { default: true }
					});
				});
			}

			var node_7 = $.sibling(node_6, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;

					$.next();

					var text_1 = $.text();

					$.template_effect(($0) => $.set_text(text_1, $0), [() => format(data().date, 'day')]);
					$.append($$anchor, text_1);
				};

				$.component(node_7, () => Tooltip.Root, ($$anchor, Tooltip_Root_1) => {
					Tooltip_Root_1($$anchor, {
						x: 4,
						y: 4,
						variant: 'none',
						class: 'text-sm font-semibold leading-3',
						children,
						$$slots: { default: true }
					});
				});
			}

			var node_8 = $.sibling(node_7, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;

					$.next();

					var text_2 = $.text();

					$.template_effect(($0) => $.set_text(text_2, $0), [() => format(data().date, 'day')]);
					$.append($$anchor, text_2);
				};

				let $0 = $.derived(() => context().height + context().padding.top + 2);

				$.component(node_8, () => Tooltip.Root, ($$anchor, Tooltip_Root_2) => {
					Tooltip_Root_2($$anchor, {
						x: 'data',
						get y() {
							return $.get($0);
						},
						anchor: 'top',
						variant: 'none',
						class: 'text-sm font-semibold bg-primary text-primary-content leading-3 px-2 py-1 rounded-sm whitespace-nowrap',
						children,
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			yDomain: [0, null],
			yNice: true,
			padding: { top: 20, bottom: 20 },
			tooltipContext: { mode: 'quadtree-x' },
			height: 300,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}