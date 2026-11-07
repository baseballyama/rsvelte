import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Button, Field, Menu, RangeField, Switch, Toggle } from 'svelte-ux';
import { AnnotationLine, Circle, LineChart } from 'layerchart';
import { movable } from '$lib/attachments/movable.js';

const data = await getAppleStock();
var root = $.from_html(`<span class="text-sm"> </span>`);
var root_1 = $.from_html(`<div class="grid grid-cols-3 gap-1 p-1"></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="flex flex-wrap gap-2 mb-2 screenshot-hidden"><!> <!> <!> <!></div> <!>`, 1);

export default function Playground($$anchor, $$props) {
	$.push($$props, true);

	const placementOptions = [
		'top-left',
		'top',
		'top-right',
		'left',
		'center',
		'right',
		'bottom-left',
		'bottom',
		'bottom-right'
	];

	let x1 = $.state($.proxy(new Date('2009-01-01')));
	let y1 = $.state(200);
	let x2 = $.state($.proxy(new Date('2010-12-31')));
	let y2 = $.state(600);
	let placement = $.state('top');
	let xOffset = $.state(0);
	let yOffset = $.state(0);
	let showControls = $.state(true);
	var $$exports = { data };
	var fragment = root_3();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Field(node, {
		label: 'Show controls',
		class: 'w-26 shrink-0',
		children: ($$anchor, $$slotProps) => {
			Switch($$anchor, {
				get checked() {
					return $.get(showControls);
				},

				set checked($$value) {
					$.set(showControls, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Toggle(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const open = $.derived(() => $$slotProps.on);
				const toggle = $.derived(() => $$slotProps.toggle);
				var fragment_2 = root_2();
				var node_2 = $.first_child(fragment_2);

				Field(node_2, {
					label: 'Placement',
					class: 'cursor-pointer flex-1 basis-40',
					$$events: {
						click: function (...$$args) {
							$.get(toggle)?.apply(this, $$args);
						}
					},

					children: ($$anchor, $$slotProps) => {
						var span = root();
						var text = $.only_child(span, true);

						$.template_effect(() => $.set_text(text, $.get(placement)));
						$.append($$anchor, span);
					},
					$$slots: { default: true }
				});

				var node_3 = $.sibling(node_2, 2);

				Menu(node_3, {
					get open() {
						return $.get(open);
					},
					placement: 'bottom-start',
					$$events: {
						close: function (...$$args) {
							$.get(toggle)?.apply(this, $$args);
						}
					},

					children: ($$anchor, $$slotProps) => {
						var div_1 = root_1();

						$.each(div_1, 20, () => placementOptions, (option) => option, ($$anchor, option) => {
							{
								let $0 = $.derived(() => option === $.get(placement) ? 'primary' : 'default');

								Button($$anchor, {
									variant: 'outline',
									get color() {
										return $.get($0);
									},
									$$events: { click: () => $.set(placement, option, true) },
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, option));
										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							}
						});

						$.reset(div_1);
						$.append($$anchor, div_1);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_2);
			}
		}
	});

	var node_4 = $.sibling(node_1, 2);

	RangeField(node_4, {
		label: 'X offset',
		min: -100,
		max: 100,
		classes: { root: 'flex-1 basis-40' },
		get value() {
			return $.get(xOffset);
		},

		set value($$value) {
			$.set(xOffset, $$value, true);
		}
	});

	var node_5 = $.sibling(node_4, 2);

	RangeField(node_5, {
		label: 'Y offset',
		min: -100,
		max: 100,
		classes: { root: 'flex-1 basis-40' },
		get value() {
			return $.get(yOffset);
		},

		set value($$value) {
			$.set(yOffset, $$value, true);
		}
	});

	$.reset(div);

	var node_6 = $.sibling(div, 2);

	{
		const aboveMarks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_5 = root_2();
			var node_7 = $.first_child(fragment_5);

			AnnotationLine(node_7, {
				get x1() {
					return $.get(x1);
				},

				get y1() {
					return $.get(y1);
				},

				get x2() {
					return $.get(x2);
				},

				get y2() {
					return $.get(y2);
				},

				get label() {
					return $.get(placement);
				},

				get labelPlacement() {
					return $.get(placement);
				},

				get labelXOffset() {
					return $.get(xOffset);
				},

				get labelYOffset() {
					return $.get(yOffset);
				},

				props: {
					line: { dashArray: [2, 2], stroke: 'var(--color-danger)' },
					label: { fill: 'var(--color-danger)' }
				}
			});

			var node_8 = $.sibling(node_7, 2);

			{
				var consequent = ($$anchor) => {
					const xScale = $.derived(() => context().xScale);
					const yScale = $.derived(() => context().yScale);
					const xInvert = $.derived(() => context().xScale.invert);
					const yInvert = $.derived(() => context().yScale.invert);
					var fragment_6 = root_2();
					var node_9 = $.first_child(fragment_6);

					{
						let $0 = $.derived(() => $.get(xScale)($.get(x1)));
						let $1 = $.derived(() => $.get(yScale)($.get(y1)));

						Circle(node_9, {
							get cx() {
								return $.get($0);
							},

							get cy() {
								return $.get($1);
							},
							r: 6,
							class: 'fill-danger/20 stroke-danger cursor-move [stroke-dasharray:3_3]',
							[$.attachment()]: ($$node) => (movable({
								onMove: ({ dx, dy }) => {
									$.set(x1, $.get(xInvert)($.get(xScale)($.get(x1)) + dx), true);
									$.set(y1, $.get(yInvert)($.get(yScale)($.get(y1)) + dy), true);
								}
							}) || $.noop)($$node)
						});
					}

					var node_10 = $.sibling(node_9, 2);

					{
						let $0 = $.derived(() => $.get(xScale)($.get(x2)));
						let $1 = $.derived(() => $.get(yScale)($.get(y2)));

						Circle(node_10, {
							get cx() {
								return $.get($0);
							},

							get cy() {
								return $.get($1);
							},
							r: 6,
							class: 'fill-danger/20 stroke-danger cursor-move [stroke-dasharray:3_3]',
							[$.attachment()]: ($$node) => (movable({
								onMove: ({ dx, dy }) => {
									$.set(x2, $.get(xInvert)($.get(xScale)($.get(x2)) + dx), true);
									$.set(y2, $.get(yInvert)($.get(yScale)($.get(y2)) + dy), true);
								}
							}) || $.noop)($$node)
						});
					}

					$.append($$anchor, fragment_6);
				};

				$.if(node_8, ($$render) => {
					if ($.get(showControls)) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_5);
		};

		LineChart(node_6, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			height: 300,
			padding: { top: 10, bottom: 20, left: 25 },
			tooltipContext: false,
			aboveMarks,
			$$slots: { aboveMarks: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}