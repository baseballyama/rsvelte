import * as $ from 'svelte/internal/server';

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

export default function Tooltips($$renderer) {
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

	let side = "point";
	let align = "center";
	let at = $.derived(() => getAt(side, align));
	let arrow = true;
	let touch = false;
	let overflow = false;
	let delay = 200;
	let isModalOpen = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="demo-box properties svelte-od1v3x"><h3>Tooltip Properties</h3> `);

		Field($$renderer, {
			label: 'Side',
			children: ($$renderer) => {
				Segmented($$renderer, {
					options: SEGMENTED_SIDE_OPTIONS,
					get value() {
						return side;
					},

					set value($$value) {
						side = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Align',
			children: ($$renderer) => {
				Segmented($$renderer, {
					options: SEGMENTED_ALIGN_OPTIONS,
					get value() {
						return align;
					},

					set value($$value) {
						align = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Delay',
			children: ($$renderer) => {
				Slider($$renderer, {
					min: 0,
					max: 500,
					step: 25,
					label: `${delay} ms`,
					get value() {
						return delay;
					},

					set value($$value) {
						delay = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div style="display: flex; align-items: center; gap: 16px;">`);

		Checkbox($$renderer, {
			label: 'Arrow',
			get value() {
				return arrow;
			},

			set value($$value) {
				arrow = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Checkbox($$renderer, {
			label: 'Enable on Touch Devices',
			get value() {
				return touch;
			},

			set value($$value) {
				touch = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Checkbox($$renderer, {
			label: 'Overflow Only',
			get value() {
				return overflow;
			},

			set value($$value) {
				overflow = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div></div> <div class="demo-box"><h3>Tooltip Area</h3> `);

		Tooltip($$renderer, {
			at: at(),
			arrow,
			delay,
			touch,
			overflow,
			children: ($$renderer) => {
				$$renderer.push(`<div class="item margin svelte-od1v3x" data-tooltip-text="This is a tooltip!">Hover to see the tooltip</div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Controls with Tooltip</h3> `);

		Tooltip($$renderer, {
			at: at(),
			arrow,
			delay,
			touch,
			overflow,
			children: ($$renderer) => {
				$$renderer.push(`<div class="controls svelte-od1v3x"><div>`);

				Button($$renderer, {
					type: 'primary',
					tooltip: 'I am a button',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Button`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				Icon($$renderer, { css: 'wxi-star', tooltip: 'I am an icon' });
				$$renderer.push(`<!----></div> `);
				Combo($$renderer, { tooltip: 'I am a combo box', options: users, value: 87 });
				$$renderer.push(`<!----> `);

				Button($$renderer, {
					css: 'button-overflow',
					tooltip: 'With overflow=true, this is the only visible tooltip in this section',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Overflowing text in button`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Tooltips in Modals</h3> `);

		Button($$renderer, {
			onclick: () => isModalOpen = true,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Open Modal`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (isModalOpen) {
			$$renderer.push('<!--[0-->');

			Modal($$renderer, {
				buttons: ["ok"],
				onconfirm: () => isModalOpen = false,
				children: ($$renderer) => {
					$$renderer.push(`<div class="modal-content"><h3>Modal Content</h3> <p>This is a modal with a tooltip.</p> `);

					Tooltip($$renderer, {
						at: at(),
						arrow,
						delay,
						touch,
						overflow,
						children: ($$renderer) => {
							$$renderer.push(`<div class="item svelte-od1v3x" data-tooltip-text="This is a tooltip inside a modal!">Hover to see the tooltip</div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="demo-box"><h3>Custom Tooltip Content and Resolver</h3> `);

		Tooltip($$renderer, {
			at: at(),
			arrow,
			touch,
			delay,
			overflow,
			content: MyTooltipContent,
			resolver: (element) => element.matches(".grid > div")
				? {
					x: Number(element.dataset.x),
					y: Number(element.dataset.y),
					value: Number(element.textContent)
				}
				: null,

			children: ($$renderer) => {
				$$renderer.push(`<div class="grid svelte-od1v3x"><div data-x="0" data-y="0" class="svelte-od1v3x">10</div> <div data-x="1" data-y="0" class="svelte-od1v3x">20</div> <div data-x="2" data-y="0" class="svelte-od1v3x">30</div> <div data-x="0" data-y="1" class="svelte-od1v3x">40</div> <div data-x="1" data-y="1" class="svelte-od1v3x">50</div> <div data-x="2" data-y="1" class="svelte-od1v3x">60</div> <div data-x="0" data-y="2" class="svelte-od1v3x">70</div> <div data-x="1" data-y="2" class="svelte-od1v3x">80</div> <div data-x="2" data-y="2" class="svelte-od1v3x">90</div></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Nested Tooltips</h3> `);

		Tooltip($$renderer, {
			at: 'top-center',
			arrow: true,
			children: ($$renderer) => {
				$$renderer.push(`<div class="item svelte-od1v3x" data-tooltip-text="Outer Tooltip"><div style="margin-bottom: 20px;">Outer Tooltip</div> `);

				Tooltip($$renderer, {
					at: 'right-center',
					arrow: true,
					children: ($$renderer) => {
						$$renderer.push(`<div class="item svelte-od1v3x" style="margin: 0;" data-tooltip-text="Inner Tooltip">Inner Tooltip</div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}