<script lang="ts">
	import type { Texts } from '$lib/utils/texts.js';
	import type { RgbaColor, HsvaColor } from 'colord';

	interface Props {
		/** if set to false, disables the alpha channel */
		isAlpha: boolean;
		/** rgb color */
		rgb: RgbaColor;
		/** hsv color */
		hsv: HsvaColor;
		/** hex color */
		hex: string;
		/** configure which hex, rgb and hsv inputs will be visible and in which order. If overridden, it is necessary to provide at least one value */
		textInputModes: Array<'hex' | 'rgb' | 'hsv'>;
		/** all translation tokens used in the library; can be partially overridden; see [full object type](https://github.com/Ennoriel/svelte-awesome-color-picker/blob/master/src/lib/utils/texts.ts) */
		texts: Texts;
		/** listener, dispatch an event when one of the color changes */
		onInput: (color: { hsv?: HsvaColor; rgb?: RgbaColor; hex?: string }) => void;
	}

	let {
		isAlpha,
		rgb = $bindable(),
		hsv = $bindable(),
		hex = $bindable(),
		textInputModes,
		texts,
		onInput
	}: Props = $props();

	const HEX_COLOR_REGEX = /^#?([A-F0-9]{6}|[A-F0-9]{8})$/i;

	let mode: 'hex' | 'rgb' | 'hsv' = $derived(textInputModes[0] || 'hex');

	let nextMode = $derived(textInputModes[(textInputModes.indexOf(mode) + 1) % textInputModes.length]);

	let h = $derived(Math.round(hsv.h));
	let s = $derived(Math.round(hsv.s));
	let v = $derived(Math.round(hsv.v));
	let a = $derived(hsv.a === undefined ? 1 : Math.round(hsv.a * 100) / 100);

	type InputEvent = Event & { currentTarget: EventTarget & HTMLInputElement };

	function updateHex(e: InputEvent) {
		const target = e.target as HTMLInputElement;
		if (HEX_COLOR_REGEX.test(target.value)) {
			hex = target.value;
			onInput({ hex });
		}
	}

	function updateRgb(property: string) {
		return function (e: InputEvent) {
			let value = parseFloat((e.target as HTMLInputElement).value);
			rgb = { ...rgb, [property]: isNaN(value) ? 0 : value };
			onInput({ rgb });
		};
	}

	function updateHsv(property: string) {
		return function (e: InputEvent) {
			let value = parseFloat((e.target as HTMLInputElement).value);
			hsv = { ...hsv, [property]: isNaN(value) ? 0 : value };
			onInput({ hsv });
		};
	}
</script>

<div class="text-input">
	<div class="input-container">
		{#if mode === 'hex'}
			<input aria-label={texts.label.hex} value={hex} oninput={updateHex} style:flex={3} />
		{:else if mode === 'rgb'}
			<input aria-label={texts.label.r} value={rgb.r} type="number" min="0" max="255" oninput={updateRgb('r')} />
			<input aria-label={texts.label.g} value={rgb.g} type="number" min="0" max="255" oninput={updateRgb('g')} />
			<input aria-label={texts.label.b} value={rgb.b} type="number" min="0" max="255" oninput={updateRgb('b')} />
		{:else}
			<input aria-label={texts.label.h} value={h} type="number" min="0" max="360" oninput={updateHsv('h')} />
			<input aria-label={texts.label.s} value={s} type="number" min="0" max="100" oninput={updateHsv('s')} />
			<input aria-label={texts.label.v} value={v} type="number" min="0" max="100" oninput={updateHsv('v')} />
		{/if}
		{#if isAlpha}
			<input
				aria-label={texts.label.a}
				value={a}
				type="number"
				min="0"
				max="1"
				step="0.01"
				oninput={mode === 'hsv' ? updateHsv('a') : updateRgb('a')}
			/>
		{/if}
	</div>

	{#if textInputModes.length > 1}
		<button type="button" onclick={() => (mode = nextMode)}>
			<span class="disappear" aria-hidden="true">{texts.color[mode]}</span>
			<span class="appear">{texts.changeTo} {texts.color[nextMode]}</span>
		</button>
	{:else}
		<div class="button-like">{texts.color[mode]}</div>
	{/if}
</div>

<!-- 
@component text inputs for the hex, rgb and hsv colors. This component cannot be imported
directly but can be overridden.

**Import**
_N.A._

**Use**
_N.A._

**Props**
@prop isAlpha: boolean — if set to false, disables the alpha channel
@prop rgb: RgbaColor — rgb color
@prop hsv: HsvaColor — hsv color
@prop hex: string — hex color
@prop textInputModes: Array&lt;'hex' | 'rgb' | 'hsv'&gt; — configure which hex, rgb and hsv inputs will be visible and in which order. If overridden, it is necessary to provide at least one value
@prop texts: Texts — all translation tokens used in the library; can be partially overridden; see [full object type](https://github.com/Ennoriel/svelte-awesome-color-picker/blob/master/src/lib/utils/texts.ts)
@prop onInput: (color: { hsv?: HsvaColor; rgb?: RgbaColor; hex?: string }) =&gt; void — listener, dispatch an event when one of the color changes
-->
<style>
	.text-input {
		margin: var(--text-input-margin, 5px 0 0);
	}
	.input-container {
		display: flex;
		flex: 1;
		gap: 10px;
	}
	input,
	button,
	.button-like {
		flex: 1;
		border: none;
		background-color: var(--cp-input-color, #eee);
		color: var(--cp-text-color, var(--cp-border-color));
		padding: 0;
		border-radius: 5px;
		height: 30px;
		line-height: 30px;
		text-align: center;
	}
	input {
		width: 5px;
		font-family: inherit;
	}

	button,
	.button-like {
		position: relative;
		flex: 1;
		margin: 8px 0 0;
		height: 30px;
		width: 100%;
		transition: background-color 0.2s;
		cursor: pointer;
		font-family: inherit;
	}

	.button-like {
		cursor: default;
	}

	.appear,
	.disappear {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 100%;
		transition: all 0.5s;
	}
	button:hover .disappear,
	.appear {
		opacity: 0;
	}

	.disappear,
	button:hover .appear {
		opacity: 1;
	}

	button:hover {
		background-color: var(--cp-button-hover-color, #ccc);
	}

	input:focus,
	button:focus {
		outline: none;
	}

	input:focus-visible,
	button:focus-visible {
		outline: 2px solid var(--focus-color, red);
		outline-offset: 2px;
	}
</style>
