import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Icon, MenuButton, Tooltip } from 'svelte-ux';
import LucideFocus from '~icons/lucide/focus';
import LucideChevronDown from '~icons/lucide/chevron-down';
import LucideCircleOff from '~icons/lucide/circle-off';
import LucideImageUpscale from '~icons/lucide/image-upscale';
import LucideMove from '~icons/lucide/move';
import LucideUndo2 from '~icons/lucide/undo-2';
import LucideZoomIn from '~icons/lucide/zoom-in';
import LucideZoomOut from '~icons/lucide/zoom-out';
import { getChartContext } from 'layerchart';

var root = $.from_html(`<div><!> <!> <!> <!> <!></div>`);

export default function TransformContextControls($$anchor, $$props) {
	$.push($$props, true);

	let placement = $.prop($$props, 'placement', 3, 'top-right'),
		orientation = $.prop($$props, 'orientation', 3, 'vertical'),
		size = $.prop($$props, 'size', 3, 'md'),
		show = $.prop($$props, 'show', 19, () => ['zoomIn', 'zoomOut', 'center', 'reset', 'scrollMode']);

	const menuPlacementByOrientationAndPlacement = $.derived(() => ({
		horizontal: {
			'top-left': 'bottom-end',
			top: 'bottom-end',
			'top-right': 'bottom-end',
			left: 'bottom-end',
			center: 'bottom-end',
			right: 'bottom-end',
			'bottom-left': 'top-end',
			bottom: 'top-end',
			'bottom-right': 'top-end'
		},
		vertical: {
			'top-left': 'right-start',
			top: 'right-start',
			'top-right': 'left-start',
			left: 'right-start',
			center: 'right-start',
			right: 'left-start',
			'bottom-left': 'right-end',
			bottom: 'right-end',
			'bottom-right': 'left-end'
		}
	}));

	const chart = getChartContext();
	var div = root();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			Tooltip($$anchor, {
				title: 'Zoom in',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						get icon() {
							return LucideZoomIn;
						},

						get size() {
							return size();
						},
						class: 'text-surface-content p-2',
						$$events: { click: () => chart.transform.zoomIn() }
					});
				},
				$$slots: { default: true }
			});
		};

		var d = $.derived(() => show().includes('zoomIn'));

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			Tooltip($$anchor, {
				title: 'Zoom out',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						get icon() {
							return LucideZoomOut;
						},

						get size() {
							return size();
						},
						class: 'text-surface-content p-2',
						$$events: { click: () => chart.transform.zoomOut() }
					});
				},
				$$slots: { default: true }
			});
		};

		var d_1 = $.derived(() => show().includes('zoomOut'));

		$.if(node_1, ($$render) => {
			if ($.get(d_1)) $$render(consequent_1);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			Tooltip($$anchor, {
				title: 'Center',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						get icon() {
							return LucideFocus;
						},

						get size() {
							return size();
						},
						class: 'text-surface-content p-2',
						$$events: { click: () => chart.transform.translateCenter() }
					});
				},
				$$slots: { default: true }
			});
		};

		var d_2 = $.derived(() => show().includes('center'));

		$.if(node_2, ($$render) => {
			if ($.get(d_2)) $$render(consequent_2);
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent_3 = ($$anchor) => {
			Tooltip($$anchor, {
				title: 'Reset',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						get icon() {
							return LucideUndo2;
						},

						get size() {
							return size();
						},
						class: 'text-surface-content p-2',
						$$events: { click: () => chart.transform.reset() }
					});
				},
				$$slots: { default: true }
			});
		};

		var d_3 = $.derived(() => show().includes('reset'));

		$.if(node_3, ($$render) => {
			if ($.get(d_3)) $$render(consequent_3);
		});
	}

	var node_4 = $.sibling(node_3, 2);

	{
		var consequent_4 = ($$anchor) => {
			Tooltip($$anchor, {
				title: 'Scroll mode',
				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => [
							{ label: 'None', value: 'none', icon: LucideCircleOff },
							{ label: 'Zoom', value: 'scale', icon: LucideImageUpscale },
							{ label: 'Move', value: 'translate', icon: LucideMove }
						]);

						let $1 = $.derived(() => ({
							placement: $.get(menuPlacementByOrientationAndPlacement)[orientation()][placement()]
						}));

						MenuButton($$anchor, {
							iconOnly: true,
							get options() {
								return $.get($0);
							},

							get menuProps() {
								return $.get($1);
							},
							menuIcon: null,
							get size() {
								return size();
							},

							get value() {
								return chart.transform.scrollMode;
							},
							class: 'text-surface-content',
							$$events: { change: (e) => chart.transform.scrollMode = e.detail.value },
							$$slots: {
								selection: ($$anchor, $$slotProps) => {
									const value = $.derived(() => $$slotProps.value);
									var fragment_10 = $.comment();
									var node_5 = $.first_child(fragment_10);

									$.key(node_5, () => $.get(value), ($$anchor) => {
										{
											let $0 = $.derived(() => $.get(value)?.icon ?? LucideChevronDown);

											Icon($$anchor, {
												get data() {
													return $.get($0);
												}
											});
										}
									});

									$.append($$anchor, fragment_10);
								}
							}
						});
					}
				},
				$$slots: { default: true }
			});
		};

		var d_4 = $.derived(() => show().includes('scrollMode'));

		$.if(node_4, ($$render) => {
			if ($.get(d_4)) $$render(consequent_4);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, $.clsx(['lc-transform-controls screenshot-hidden', $$props.class]), 'svelte-1i98pia');
		$.set_attribute(div, 'data-orientation', orientation());
		$.set_attribute(div, 'data-placement', placement());
	});

	$.delegated('dblclick', div, (e) => {
		// Stop from propagating to TransformContext
		e.stopPropagation();
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['dblclick']);