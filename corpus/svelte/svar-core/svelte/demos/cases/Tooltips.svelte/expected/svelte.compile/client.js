import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Button,
	Checkbox,
	Combo,
	Field,
	Icon,
	Modal,
	Segmented,
	Slider,
	Tooltip
} from "../../src";

import MyTooltipContent from "../custom/MyTooltipContent.svelte";
import { users } from "../data/userlist";

var root = $.from_html(`<div class="item margin svelte-od1v3x" data-tooltip-text="This is a tooltip!">Hover to see the tooltip</div>`);
var root_1 = $.from_html(`<div class="controls svelte-od1v3x"><div><!> <!></div> <!> <!></div>`);
var root_2 = $.from_html(`<div class="item svelte-od1v3x" data-tooltip-text="This is a tooltip inside a modal!">Hover to see the tooltip</div>`);
var root_3 = $.from_html(`<div class="modal-content"><h3>Modal Content</h3> <p>This is a modal with a tooltip.</p> <!></div>`);
var root_4 = $.from_html(`<div class="grid svelte-od1v3x"><div data-x="0" data-y="0" class="svelte-od1v3x">10</div> <div data-x="1" data-y="0" class="svelte-od1v3x">20</div> <div data-x="2" data-y="0" class="svelte-od1v3x">30</div> <div data-x="0" data-y="1" class="svelte-od1v3x">40</div> <div data-x="1" data-y="1" class="svelte-od1v3x">50</div> <div data-x="2" data-y="1" class="svelte-od1v3x">60</div> <div data-x="0" data-y="2" class="svelte-od1v3x">70</div> <div data-x="1" data-y="2" class="svelte-od1v3x">80</div> <div data-x="2" data-y="2" class="svelte-od1v3x">90</div></div>`);
var root_5 = $.from_html(`<div class="item svelte-od1v3x" style="margin: 0;" data-tooltip-text="Inner Tooltip">Inner Tooltip</div>`);
var root_6 = $.from_html(`<div class="item svelte-od1v3x" data-tooltip-text="Outer Tooltip"><div style="margin-bottom: 20px;">Outer Tooltip</div> <!></div>`);
var root_7 = $.from_html(`<div class="demo-box properties svelte-od1v3x"><h3>Tooltip Properties</h3> <!> <!> <!> <div style="display: flex; align-items: center; gap: 16px;"><!> <!> <!></div></div> <div class="demo-box"><h3>Tooltip Area</h3> <!></div> <div class="demo-box"><h3>Controls with Tooltip</h3> <!></div> <div class="demo-box"><h3>Tooltips in Modals</h3> <!> <!></div> <div class="demo-box"><h3>Custom Tooltip Content and Resolver</h3> <!></div> <div class="demo-box"><h3>Nested Tooltips</h3> <!></div>`, 1);

export default function Tooltips($$anchor) {
	const SEGMENTED_SIDE_OPTIONS = [
		{ id: "point", label: "Point" },
		{ id: "top", label: "Top" },
		{ id: "bottom", label: "Bottom" },
		{ id: "left", label: "Left" },
		{ id: "right", label: "Right" }
	];

	const SEGMENTED_ALIGN_OPTIONS = [
		{ id: "start", label: "Start" },
		{ id: "center", label: "Center" },
		{ id: "end", label: "End" }
	];

	function getAt(side, align) {
		if (side === "point") return "point";

		return `${side}-${align}`;
	}

	let side = $.state("point");
	let align = $.state("center");
	let at = $.derived(() => getAt($.get(side), $.get(align)));
	let arrow = $.state(true);
	let touch = $.state(false);
	let overflow = $.state(false);
	let delay = $.state(200);
	let isModalOpen = $.state(false);
	var fragment = root_7();
	var div = $.first_child(fragment);
	var node = $.sibling($.child(div), 2);

	Field(node, {
		label: 'Side',
		children: ($$anchor, $$slotProps) => {
			Segmented($$anchor, {
				get options() {
					return SEGMENTED_SIDE_OPTIONS;
				},

				get value() {
					return $.get(side);
				},

				set value($$value) {
					$.set(side, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Field(node_1, {
		label: 'Align',
		children: ($$anchor, $$slotProps) => {
			Segmented($$anchor, {
				get options() {
					return SEGMENTED_ALIGN_OPTIONS;
				},

				get value() {
					return $.get(align);
				},

				set value($$value) {
					$.set(align, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Field(node_2, {
		label: 'Delay',
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => `${$.get(delay)} ms`);

				Slider($$anchor, {
					min: 0,
					max: 500,
					step: 25,
					get label() {
						return $.get($0);
					},

					get value() {
						return $.get(delay);
					},

					set value($$value) {
						$.set(delay, $$value, true);
					}
				});
			}
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node_2, 2);
	var node_3 = $.child(div_1);

	Checkbox(node_3, {
		label: 'Arrow',
		get value() {
			return $.get(arrow);
		},

		set value($$value) {
			$.set(arrow, $$value, true);
		}
	});

	var node_4 = $.sibling(node_3, 2);

	Checkbox(node_4, {
		label: 'Enable on Touch Devices',
		get value() {
			return $.get(touch);
		},

		set value($$value) {
			$.set(touch, $$value, true);
		}
	});

	var node_5 = $.sibling(node_4, 2);

	Checkbox(node_5, {
		label: 'Overflow Only',
		get value() {
			return $.get(overflow);
		},

		set value($$value) {
			$.set(overflow, $$value, true);
		}
	});

	$.reset(div_1);
	$.reset(div);

	var div_2 = $.sibling(div, 2);
	var node_6 = $.sibling($.child(div_2), 2);

	Tooltip(node_6, {
		get at() {
			return $.get(at);
		},

		get arrow() {
			return $.get(arrow);
		},

		get delay() {
			return $.get(delay);
		},

		get touch() {
			return $.get(touch);
		},

		get overflow() {
			return $.get(overflow);
		},

		children: ($$anchor, $$slotProps) => {
			var div_3 = root();

			$.append($$anchor, div_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var node_7 = $.sibling($.child(div_4), 2);

	Tooltip(node_7, {
		get at() {
			return $.get(at);
		},

		get arrow() {
			return $.get(arrow);
		},

		get delay() {
			return $.get(delay);
		},

		get touch() {
			return $.get(touch);
		},

		get overflow() {
			return $.get(overflow);
		},

		children: ($$anchor, $$slotProps) => {
			var div_5 = root_1();
			var div_6 = $.child(div_5);
			var node_8 = $.child(div_6);

			Button(node_8, {
				type: 'primary',
				tooltip: 'I am a button',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Button');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			Icon(node_9, { css: 'wxi-star', tooltip: 'I am an icon' });
			$.reset(div_6);

			var node_10 = $.sibling(div_6, 2);

			Combo(node_10, {
				tooltip: 'I am a combo box',
				get options() {
					return users;
				},
				value: 87
			});

			var node_11 = $.sibling(node_10, 2);

			Button(node_11, {
				css: 'button-overflow',
				tooltip: 'With overflow=true, this is the only visible tooltip in this section',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Overflowing text in button');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_5);
			$.append($$anchor, div_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);

	var div_7 = $.sibling(div_4, 2);
	var node_12 = $.sibling($.child(div_7), 2);

	Button(node_12, {
		onclick: () => $.set(isModalOpen, true),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Open Modal');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 2);

	{
		var consequent = ($$anchor) => {
			Modal($$anchor, {
				buttons: ["ok"],
				onconfirm: () => $.set(isModalOpen, false),
				children: ($$anchor, $$slotProps) => {
					var div_8 = root_3();
					var node_14 = $.sibling($.child(div_8), 4);

					Tooltip(node_14, {
						get at() {
							return $.get(at);
						},

						get arrow() {
							return $.get(arrow);
						},

						get delay() {
							return $.get(delay);
						},

						get touch() {
							return $.get(touch);
						},

						get overflow() {
							return $.get(overflow);
						},

						children: ($$anchor, $$slotProps) => {
							var div_9 = root_2();

							$.append($$anchor, div_9);
						},
						$$slots: { default: true }
					});

					$.reset(div_8);
					$.append($$anchor, div_8);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_13, ($$render) => {
			if ($.get(isModalOpen)) $$render(consequent);
		});
	}

	$.reset(div_7);

	var div_10 = $.sibling(div_7, 2);
	var node_15 = $.sibling($.child(div_10), 2);

	Tooltip(node_15, {
		get at() {
			return $.get(at);
		},

		get arrow() {
			return $.get(arrow);
		},

		get touch() {
			return $.get(touch);
		},

		get delay() {
			return $.get(delay);
		},

		get overflow() {
			return $.get(overflow);
		},

		get content() {
			return MyTooltipContent;
		},

		resolver: (element) => element.matches(".grid > div")
			? {
				x: Number(element.dataset.x),
				y: Number(element.dataset.y),
				value: Number(element.textContent)
			}
			: null,

		children: ($$anchor, $$slotProps) => {
			var div_11 = root_4();

			$.append($$anchor, div_11);
		},
		$$slots: { default: true }
	});

	$.reset(div_10);

	var div_12 = $.sibling(div_10, 2);
	var node_16 = $.sibling($.child(div_12), 2);

	Tooltip(node_16, {
		at: 'top-center',
		arrow: true,
		children: ($$anchor, $$slotProps) => {
			var div_13 = root_6();
			var node_17 = $.sibling($.child(div_13), 2);

			Tooltip(node_17, {
				at: 'right-center',
				arrow: true,
				children: ($$anchor, $$slotProps) => {
					var div_14 = root_5();

					$.append($$anchor, div_14);
				},
				$$slots: { default: true }
			});

			$.reset(div_13);
			$.append($$anchor, div_13);
		},
		$$slots: { default: true }
	});

	$.reset(div_12);
	$.append($$anchor, fragment);
}