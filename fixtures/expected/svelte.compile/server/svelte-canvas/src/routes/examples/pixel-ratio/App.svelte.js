import * as $ from 'svelte/internal/server';
import { Canvas, Layer } from '$lib';

export default function App($$renderer) {
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

	let heightSetting = heights[0];
	let pixelRatioSetting = pixelRatios[0];
	let pixelRatioValue = void 0;

	$$renderer.push(`<div class="controls svelte-erjzvw"><div>canvas height: <!--[-->`);

	const each_array = $.ensure_array_like(heights);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let option = each_array[$$index];

		$$renderer.push(`<button${$.attr('disabled', option.label === heightSetting.label, true)}>${$.escape(option.label)}</button>`);
	}

	$$renderer.push(`<!--]--></div> <div>pixel ratio: <!--[-->`);

	const each_array_1 = $.ensure_array_like(pixelRatios);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let option = each_array_1[$$index_1];

		$$renderer.push(`<button${$.attr('disabled', option.label === pixelRatioSetting.label, true)}>${$.escape(option.label)}</button>`);
	}

	$$renderer.push(`<!--]--></div></div> `);

	Canvas($$renderer, {
		height: heightSetting.value,
		pixelRatio: pixelRatioSetting.value,
		onresize: (e) => pixelRatioValue = e.pixelRatio,
		children: ($$renderer) => {
			Layer($$renderer, {
				render: ({ context, width }) => {
					context.font = `${width / 20}px 'Fira Mono', monospace`;
					context.textAlign = 'center';
					context.textBaseline = 'middle';
					context.fillStyle = 'tomato';
					context.fillText(`pixelRatio: ${pixelRatioValue?.toFixed(1)}`, width / 2, width / 4);
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}