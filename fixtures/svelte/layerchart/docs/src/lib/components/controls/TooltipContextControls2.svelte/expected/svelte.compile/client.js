import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Field, Menu, MenuField, Switch, Toggle } from 'svelte-ux';
import { Tooltip } from 'layerchart';

var root = $.from_html(`<span class="text-sm"> </span>`);
var root_1 = $.from_html(`<div class="grid grid-cols-3 gap-1 p-1"></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="grid grid-cols-3 gap-2 mb-4 screenshot-hidden"><!> <!> <div class="flex gap-2"><!> <!></div></div>`);

export default function TooltipContextControls2($$anchor, $$props) {
	$.push($$props, true);

	const anchorOptions = [
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

	let anchor = $.prop($$props, 'anchor', 15, 'top-left'),
		snap = $.prop($$props, 'snap', 15, 'pointer'),
		contained = $.prop($$props, 'contained', 15, false),
		portal = $.prop($$props, 'portal', 15, true);

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
					label: 'Anchor',
					class: 'cursor-pointer',
					$$events: {
						click: function (...$$args) {
							$.get(toggle)?.apply(this, $$args);
						}
					},

					children: ($$anchor, $$slotProps) => {
						var span = root();
						var text = $.only_child(span, true);

						$.template_effect(() => $.set_text(text, anchor()));
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

						$.each(div_1, 21, () => anchorOptions, $.index, ($$anchor, option) => {
							{
								let $0 = $.derived(() => $.get(option) === anchor() ? 'primary' : 'default');

								Button($$anchor, {
									variant: 'outline',
									get color() {
										return $.get($0);
									},
									$$events: { click: () => anchor($.get(option)) },
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, $.get(option)));
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

	MenuField(node_3, {
		label: 'Snap',
		options: [
			{ label: 'pointer', value: 'pointer' },
			{ label: 'data', value: 'data' }
		],

		get value() {
			return snap();
		},

		set value($$value) {
			snap($$value);
		}
	});

	var div_2 = $.sibling(node_3, 2);
	var node_4 = $.child(div_2);

	MenuField(node_4, {
		label: 'Contained',
		options: [
			{ label: 'none', value: false },
			{ label: 'container', value: 'container' },
			{ label: 'window', value: 'window' }
		],
		class: 'flex-1',
		get value() {
			return contained();
		},

		set value($$value) {
			contained($$value);
		}
	});

	var node_5 = $.sibling(node_4, 2);

	Field(node_5, {
		label: 'Portal',
		children: ($$anchor, $$slotProps) => {
			Switch($$anchor, {
				get checked() {
					return portal();
				},

				set checked($$value) {
					portal($$value);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}