import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Field, Menu, RangeField, Toggle } from 'svelte-ux';
import { cls } from '@layerstack/tailwind';

var root = $.from_html(`<span class="text-sm"> </span>`);
var root_1 = $.from_html(`<div class="grid grid-cols-3 gap-1 p-1"></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div><!> <!> <!> <!></div>`);

export default function AnnotationRangePointLineControls($$anchor, $$props) {
	$.push($$props, true);

	let placement = $.prop($$props, 'placement', 15, undefined),
		xOffset = $.prop($$props, 'xOffset', 15, undefined),
		yOffset = $.prop($$props, 'yOffset', 15, undefined),
		radius = $.prop($$props, 'radius', 15, undefined);

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

	var div = root_3();
	var node = $.child(div);

	Toggle(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const open = $.derived(() => $$slotProps.on);
				const toggle = $.derived(() => $$slotProps.toggle);
				var fragment = root_2();
				var node_1 = $.first_child(fragment);

				Field(node_1, {
					label: 'Placement',
					class: 'cursor-pointer',
					$$events: {
						click: function (...$$args) {
							$.get(toggle)?.apply(this, $$args);
						}
					},

					children: ($$anchor, $$slotProps) => {
						var span = root();
						var text = $.only_child(span, true);

						$.template_effect(() => $.set_text(text, placement()));
						$.append($$anchor, span);
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				Menu(node_2, {
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
								let $0 = $.derived(() => option === placement() ? 'primary' : 'default');

								Button($$anchor, {
									variant: 'outline',
									get color() {
										return $.get($0);
									},
									$$events: { click: () => placement(option) },
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

				$.append($$anchor, fragment);
			}
		}
	});

	var node_3 = $.sibling(node, 2);

	RangeField(node_3, {
		label: 'X offset',
		min: -20,
		max: 20,
		get value() {
			return xOffset();
		},

		set value($$value) {
			xOffset($$value);
		}
	});

	var node_4 = $.sibling(node_3, 2);

	RangeField(node_4, {
		label: 'Y offset',
		min: -20,
		max: 20,
		get value() {
			return yOffset();
		},

		set value($$value) {
			yOffset($$value);
		}
	});

	var node_5 = $.sibling(node_4, 2);

	{
		var consequent = ($$anchor) => {
			RangeField($$anchor, {
				label: 'Radius',
				max: 10,
				get value() {
					return radius();
				},

				set value($$value) {
					radius($$value);
				}
			});
		};

		$.if(node_5, ($$render) => {
			if (radius() !== undefined) $$render(consequent);
		});
	}

	$.reset(div);

	$.template_effect(($0) => $.set_class(div, 1, $0), [
		() => $.clsx(cls('grid gap-2 mb-4 screenshot-hidden', radius() !== undefined ? 'grid-cols-4' : 'grid-cols-3'))
	]);

	$.append($$anchor, div);
	$.pop();
}