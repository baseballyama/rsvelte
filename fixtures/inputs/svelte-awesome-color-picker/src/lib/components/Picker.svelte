<script lang="ts">
	import { colord } from 'colord';
	import type { Components } from '$lib/type/types.js';
	import { Slider } from 'svelte-awesome-slider';
	import type { Texts } from '$lib/utils/texts.js';

	interface Props {
		/** customize the ColorPicker component parts. Can be used to display a Chrome variant or an Accessibility Notice */
		components: Components;
		/** hue value */
		h: number;
		/** saturation value */
		s: number;
		/** vibrance value */
		v: number;
		/** indicator whether the selected color is light or dark */
		isDark: boolean;
		/** all translation tokens used in the library; can be partially overridden; see [full object type](https://github.com/Ennoriel/svelte-awesome-color-picker/blob/master/src/lib/utils/texts.ts) */
		texts: Texts;
		/** listener, dispatch an event when the user drags, clicks or tabs at the picker */
		onInput: (color: { s: number; v: number }) => void;
	}

	let { components, h, s = $bindable(), v = $bindable(), isDark, texts, onInput }: Props = $props();

	let picker: HTMLDivElement | undefined = $state();

	let isMouseDown = false;

	let pos = $state({ x: 100, y: 0 });
	let pickerColorBg = $derived(colord({ h, s: 100, v: 100, a: 1 }).toHex());

	function clamp(value: number, min: number, max: number): number {
		return Math.min(Math.max(min, value), max);
	}

	function onClick(e: { clientX: number; clientY: number }) {
		if (!picker) return;

		const { width, left, height, top } = picker.getBoundingClientRect();
		const mouse = {
			x: clamp(e.clientX - left, 0, width),
			y: clamp(e.clientY - top, 0, height)
		};

		s = clamp(mouse.x / width, 0, 1) * 100;
		v = clamp((height - mouse.y) / height, 0, 1) * 100;

		updateColor();
	}

	function pickerMousedown(e: MouseEvent) {
		e.preventDefault();
		if (e.button === 0) {
			isMouseDown = true;
			onClick(e);
		}
	}

	function mouseUp() {
		isMouseDown = false;
	}

	function mouseMove(e: MouseEvent) {
		if (isMouseDown) onClick(e);
	}

	function touch(e: TouchEvent) {
		e.preventDefault();
		onClick(e.changedTouches[0]);
	}

	$effect(() => {
		if (typeof s === 'number' && typeof v === 'number' && picker)
			pos = {
				x: s,
				y: 100 - v
			};
	});

	function updateColor(color: { s?: number; v?: number } = {}) {
		onInput({ s, v, ...color });
	}
</script>

<svelte:window onmouseup={mouseUp} onmousemove={mouseMove} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="picker"
	bind:this={picker}
	onmousedown={pickerMousedown}
	ontouchstart={touch}
	ontouchmove={touch}
	ontouchend={touch}
	style:--picker-color-bg={pickerColorBg}
>
	<components.pickerIndicator {pos} {isDark} />
	<div class="s" style:--pos-y={pos.y}>
		<Slider
			value={s}
			onInput={(s) => updateColor({ s })}
			keyboardOnly
			ariaValueText={(value) => `${value}%`}
			ariaLabel={texts.label.s}
		/>
	</div>
	<div class="v" style:--pos-x={pos.x}>
		<Slider
			value={v}
			onInput={(v) => updateColor({ v })}
			keyboardOnly
			ariaValueText={(value) => `${value}%`}
			direction="vertical"
			ariaLabel={texts.label.v}
		/>
	</div>
</div>

<!-- 
@component Picker wrapper containing the mouse and keyboard logic to select the color. _internal component_ 

**Import**
N.A.

**Use**
N.A.

**Props**
@prop components: Components — customize the ColorPicker component parts. Can be used to display a Chrome variant or an Accessibility Notice
@prop h: number — hue value
@prop s: number — saturation value
@prop v: number — vibrance value
@prop isDark: boolean — indicator whether the selected color is light or dark
@prop texts: Texts — all translation tokens used in the library; can be partially overridden; see [full object type](https://github.com/Ennoriel/svelte-awesome-color-picker/blob/master/src/lib/utils/texts.ts)
@prop onInput: (color: { s: number; v: number }) =&gt; void — listener, dispatch an event when the user drags, clicks or tabs at the picker
-->
<style>
	.picker {
		position: relative;
		display: inline-block;
		width: var(--picker-width, 200px);
		height: var(--picker-height, 200px);
		background:
			linear-gradient(#ffffff00, #000000ff), linear-gradient(0.25turn, #ffffffff, #00000000), var(--picker-color-bg);
		border-radius: var(--picker-radius, 8px);
		outline: none;
		user-select: none;
		cursor: pointer;
	}

	.s,
	.v {
		position: absolute;
		--track-background: none;
		--track-border: none;
		--thumb-background: none;
		--thumb-border: none;
		--thumb-size: 2px;
		--margin-block: 0;
		--track-height: var(--picker-indicator-size, 10px);
		user-select: none;
		-webkit-user-select: none;
	}

	.s {
		top: calc(var(--pos-y) * (var(--picker-height, 200px) - var(--picker-indicator-size, 10px) - 4px) / 100 + 2px);
		left: 2px;
		--track-width: calc(var(--picker-width, 200px) - 4px);
	}

	.v {
		top: 2px;
		left: calc(var(--pos-x) * (var(--picker-width, 200px) - var(--picker-indicator-size, 10px) - 4px) / 100 + 2px);
		--track-width: calc(var(--picker-height, 200px) - 4px);
	}
</style>
