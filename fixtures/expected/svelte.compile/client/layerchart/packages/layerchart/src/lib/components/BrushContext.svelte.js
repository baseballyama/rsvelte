import 'svelte/internal/disclose-version';
import { BrushState } from '$lib/states/brush.svelte.js';
import * as $ from 'svelte/internal/client';
import { untrack } from 'svelte';
import { brushable } from '$lib/attachments/brushable.js';
import { cls } from '@layerstack/tailwind';
import { Logger } from '@layerstack/utils';
import { getChartContext } from '$lib/contexts/chart.js';

var root = $.from_html(`<div></div> <div></div>`, 1);
var root_1 = $.from_html(`<div class="lc-brush-panel svelte-20h5iz"><div></div> <!> <!></div>`);
var root_2 = $.from_html(`<div><div><!></div> <!></div>`);

export default function BrushContext($$anchor, $$props) {
	$.push($$props, true);

	const ctx = getChartContext();

	let stateProp = $.prop($$props, 'state', 15),
		axis = $.prop($$props, 'axis', 3, 'x'),
		handleSize = $.prop($$props, 'handleSize', 3, 5),
		clickToReset = $.prop($$props, 'clickToReset', 3, true),
		disabled = $.prop($$props, 'disabled', 3, false),
		constrainToDomain = $.prop($$props, 'constrainToDomain', 3, true),
		range = $.prop($$props, 'range', 19, () => ({})),
		handle = $.prop($$props, 'handle', 19, () => ({})),
		classes = $.prop($$props, 'classes', 19, () => ({})),
		onBrushEnd = $.prop($$props, 'onBrushEnd', 3, () => {}),
		onBrushStart = $.prop($$props, 'onBrushStart', 3, () => {}),
		onChange = $.prop($$props, 'onChange', 3, () => {});

	let rootEl = $.state(void 0);

	const brushState = new BrushState(ctx, {
		x: $$props.x,
		y: $$props.y,
		axis: axis(),
		minExtent: $$props.minExtent,
		maxExtent: $$props.maxExtent,
		constrain: $$props.constrain,
		constrainToDomain: constrainToDomain()
	});

	stateProp(brushState);

	$.user_effect(() => {
		brushState.handleSize = handleSize();
	});

	// Keep constraint config in sync when props change reactively
	$.user_effect(() => {
		brushState.minExtent = $$props.minExtent;
		brushState.maxExtent = $$props.maxExtent;
		brushState.constrain = $$props.constrain;
		brushState.constrainToDomain = constrainToDomain();
	});

	const logger = new Logger('BrushContext');
	const RESET_THRESHOLD = 1; // size of pointer delta to ignore

	/**
	 * The gesture, from the `brushable` attachment — the same one a chart can attach to elements of
	 * its own.  Each part of the brush takes the mode it represents, so the handles keep their own
	 * cursors and hit areas, and the root creates a new selection.
	 */
	function gesture(mode) {
		return brushable({
			state: brushState,
			axis: axis(),
			mode,
			// Every part measures against the root, not against itself — a handle is only a few pixels
			bounds: () => $.get(rootEl)?.getBoundingClientRect(),

			// The gesture belongs to the panel it started in, and stays there — the scales are shared,
			// so the selection it produces applies to every panel.  Unfaceted charts resolve to the
			// single full-size panel, and a point in the gap between panels to none, which ignores it.
			origin: (offset) => {
				const panel = ctx.facet.panelAt(offset.x, offset.y);

				if (!panel) {
					logger.debug('ignoring drag as outside of chart bounds', { offset });

					return null;
				}

				return { x: panel.x, y: panel.y };
			},
			clearThreshold: clickToReset() ? RESET_THRESHOLD : 0,
			onChange: ({ phase }) => {
				if (phase === 'start') onBrushStart()({ brush: brushState }); else if (phase === 'brush') onChange()({ brush: brushState }); else onBrushEnd()({ brush: brushState });
			}
		});
	}

	// Sync external x/y props into brush state when provided
	$.user_pre_effect(() => {
		if ($$props.x !== undefined || $$props.y !== undefined) {
			const extX = $$props.x;
			const extY = $$props.y;

			// Avoid tracking brushState internals to prevent reactive loops
			untrack(() => brushState.syncFromExternal(extX, extY));
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children ?? $.noop, () => ({ state: brushState }));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var div = root_2();
			let styles;
			var div_1 = $.child(div);
			let styles_1;
			var node_2 = $.child(div_1);

			$.snippet(node_2, () => $$props.children ?? $.noop, () => ({ state: brushState }));
			$.reset(div_1);

			var node_3 = $.sibling(div_1, 2);

			{
				var consequent_3 = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_4 = $.first_child(fragment_2);

					$.each(node_4, 17, () => ctx.facet.panels, (panel) => panel.key, ($$anchor, panel) => {
						var div_2 = root_1();
						let styles_2;
						var div_3 = $.child(div_2);

						var event_handler = (e) => {
							// Stopped as the handles do — the root takes a double-click as "select all", which
							// would otherwise land right back on top of the selection just cleared
							e.stopPropagation();

							brushState.reset();
							onChange()({ brush: brushState });
						};

						$.attribute_effect(
							div_3,
							($0) => ({
								...range(),
								class: $0,
								ondblclick: event_handler,
								[$.STYLE]: {
									left: `${brushState.range.x ?? ''}px`,
									top: `${brushState.range.y ?? ''}px`,
									width: `${brushState.range.width ?? ''}px`,
									height: `${brushState.range.height ?? ''}px`
								}
							}),
							[() => cls('lc-brush-range', classes().range, range()?.class)],
							void 0,
							void 0,
							'svelte-20h5iz'
						);

						$.attach(div_3, () => gesture('move'));

						var node_5 = $.sibling(div_3, 2);

						{
							var consequent_1 = ($$anchor) => {
								var fragment_3 = root();
								var div_4 = $.first_child(fragment_3);

								var event_handler_1 = (e) => {
									e.stopPropagation();

									if (brushState.y[0]) {
										brushState.y[0] = brushState.yDomainMin;
										onChange()({ brush: brushState });
									}
								};

								$.attribute_effect(
									div_4,
									($0) => ({
										...handle(),
										'data-position': 'top',
										class: $0,
										ondblclick: event_handler_1,
										[$.STYLE]: {
											left: `${brushState.range.x ?? ''}px`,
											top: `${brushState.range.y ?? ''}px`,
											width: `${brushState.range.width ?? ''}px`,
											height: `${handleSize() ?? ''}px`
										}
									}),
									[
										() => cls('lc-brush-handle', classes().handle, handle()?.class)
									],
									void 0,
									void 0,
									'svelte-20h5iz'
								);

								$.attach(div_4, () => gesture('top'));

								var div_5 = $.sibling(div_4, 2);

								var event_handler_2 = (e) => {
									e.stopPropagation();

									if (brushState.y[1]) {
										brushState.y[1] = brushState.yDomainMax;
										onChange()({ brush: brushState });
									}
								};

								$.attribute_effect(
									div_5,
									($0) => ({
										...handle(),
										'data-position': 'bottom',
										class: $0,
										ondblclick: event_handler_2,
										[$.STYLE]: {
											left: `${brushState.range.x ?? ''}px`,
											top: `${brushState.range.y + brushState.range.height - handleSize()}px`,
											width: `${brushState.range.width ?? ''}px`,
											height: `${handleSize() ?? ''}px`
										}
									}),
									[
										() => cls('lc-brush-handle', classes().handle, handle()?.class)
									],
									void 0,
									void 0,
									'svelte-20h5iz'
								);

								$.attach(div_5, () => gesture('bottom'));
								$.append($$anchor, fragment_3);
							};

							$.if(node_5, ($$render) => {
								if (axis() === 'both' || axis() === 'y') $$render(consequent_1);
							});
						}

						var node_6 = $.sibling(node_5, 2);

						{
							var consequent_2 = ($$anchor) => {
								var fragment_4 = root();
								var div_6 = $.first_child(fragment_4);

								var event_handler_3 = (e) => {
									e.stopPropagation();

									if (brushState.x[0]) {
										brushState.x[0] = brushState.xDomainMin;
										onChange()({ brush: brushState });
									}
								};

								$.attribute_effect(
									div_6,
									($0) => ({
										...handle(),
										'data-position': 'left',
										class: $0,
										ondblclick: event_handler_3,
										[$.STYLE]: {
											left: `${brushState.range.x ?? ''}px`,
											top: `${brushState.range.y ?? ''}px`,
											width: `${handleSize() ?? ''}px`,
											height: `${brushState.range.height ?? ''}px`
										}
									}),
									[
										() => cls('lc-brush-handle', classes().handle, handle()?.class)
									],
									void 0,
									void 0,
									'svelte-20h5iz'
								);

								$.attach(div_6, () => gesture('left'));

								var div_7 = $.sibling(div_6, 2);

								var event_handler_4 = (e) => {
									e.stopPropagation();

									if (brushState.x[1]) {
										brushState.x[1] = brushState.xDomainMax;
										onChange()({ brush: brushState });
									}
								};

								$.attribute_effect(
									div_7,
									($0) => ({
										...handle(),
										'data-position': 'right',
										class: $0,
										ondblclick: event_handler_4,
										[$.STYLE]: {
											left: `${brushState.range.x + brushState.range.width - handleSize() + 1}px`,
											top: `${brushState.range.y ?? ''}px`,
											width: `${handleSize() ?? ''}px`,
											height: `${brushState.range.height ?? ''}px`
										}
									}),
									[
										() => cls('lc-brush-handle', classes().handle, handle()?.class)
									],
									void 0,
									void 0,
									'svelte-20h5iz'
								);

								$.attach(div_7, () => gesture('right'));
								$.append($$anchor, fragment_4);
							};

							$.if(node_6, ($$render) => {
								if (axis() === 'both' || axis() === 'x') $$render(consequent_2);
							});
						}

						$.reset(div_2);

						$.template_effect(() => styles_2 = $.set_style(div_2, '', styles_2, {
							left: `${$.get(panel).x ?? ''}px`,
							top: `${$.get(panel).y ?? ''}px`
						}));

						$.append($$anchor, div_2);
					});

					$.append($$anchor, fragment_2);
				};

				$.if(node_3, ($$render) => {
					if (brushState.active) $$render(consequent_3);
				});
			}

			$.reset(div);
			$.bind_this(div, ($$value) => $.set(rootEl, $$value), () => $.get(rootEl));
			$.attach(div, () => gesture('create'));

			$.template_effect(
				($0, $1) => {
					$.set_class(div, 1, $0, 'svelte-20h5iz');

					styles = $.set_style(div, '', styles, {
						top: `${ctx.padding.top ?? ''}px`,
						left: `${ctx.padding.left ?? ''}px`,
						width: `${ctx.box.width ?? ''}px`,
						height: `${ctx.box.height ?? ''}px`
					});

					$.set_class(div_1, 1, $1, 'svelte-20h5iz');

					styles_1 = $.set_style(div_1, '', styles_1, {
						top: `-${ctx.padding.top ?? 0 ?? ''}px`,
						left: `-${ctx.padding.left ?? 0 ?? ''}px`,
						width: `${ctx.containerWidth ?? ''}px`,
						height: `${ctx.containerHeight ?? ''}px`
					});
				},
				[
					() => $.clsx(cls('lc-brush-context')),
					() => $.clsx(cls('lc-brush-container'))
				]
			);

			$.delegated('dblclick', div, (e) => {
				brushState.selectAll();
				e.stopPropagation();
			});

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (disabled()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['dblclick']);