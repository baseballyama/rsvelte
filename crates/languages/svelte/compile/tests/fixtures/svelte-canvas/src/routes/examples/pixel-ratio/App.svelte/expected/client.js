import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas, Layer } from '$lib';

var root = $.from_html(`<button> </button>`);
var root_1 = $.from_html(`<div class="controls svelte-erjzvw"><div>canvas height: <!></div> <div>pixel ratio: <!></div></div> <!>`, 1);

export default function App($$anchor) {
	const heights = [
		{ value: 1000, label: '1000' },
		{ value: 10000, label: '10000' },
		{ value: 100000, label: '100000' }
	];

	const pixelRatios = [
		{ value: undefined, label: 'unset' },
		{ value: 3, label: '3' },
		{ value: 0.5, label: '0.5' },
		{ value: 'auto', label: "'auto'" }
	];

	let heightSetting = $.state($.proxy(heights[0]));
	let pixelRatioSetting = $.state($.proxy(pixelRatios[0]));
	let pixelRatioValue = $.state(void 0);
	var fragment = root_1();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.sibling($.child(div_1));

	$.each(node, 17, () => heights, $.index, ($$anchor, option) => {
		var button = root();
		var text = $.only_child(button, true);

		$.template_effect(() => {
			button.disabled = $.get(option).label === $.get(heightSetting).label;
			$.set_text(text, $.get(option).label);
		});

		$.delegated('click', button, () => $.set(heightSetting, $.get(option), true));
		$.append($$anchor, button);
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.sibling($.child(div_2));

	$.each(node_1, 17, () => pixelRatios, $.index, ($$anchor, option) => {
		var button_1 = root();
		var text_1 = $.only_child(button_1, true);

		$.template_effect(() => {
			button_1.disabled = $.get(option).label === $.get(pixelRatioSetting).label;
			$.set_text(text_1, $.get(option).label);
		});

		$.delegated('click', button_1, () => $.set(pixelRatioSetting, $.get(option), true));
		$.append($$anchor, button_1);
	});

	$.reset(div_2);
	$.reset(div);

	var node_2 = $.sibling(div, 2);

	Canvas(node_2, {
		get height() {
			return $.get(heightSetting).value;
		},

		get pixelRatio() {
			return $.get(pixelRatioSetting).value;
		},
		onresize: (e) => $.set(pixelRatioValue, e.pixelRatio, true),
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				render: ({ context, width }) => {
					context.font = `${width / 20}px 'Fira Mono', monospace`;
					context.textAlign = 'center';
					context.textBaseline = 'middle';
					context.fillStyle = 'tomato';
					context.fillText(`pixelRatio: ${$.get(pixelRatioValue)?.toFixed(1)}`, width / 2, width / 4);
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);