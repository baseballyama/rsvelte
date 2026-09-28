<script lang="ts">
	import type { A11yColor, Components } from '$lib/type/types.js';
	import { defaultTexts, type A11yTextsPartial, type TextsPartial } from '$lib/utils/texts.js';
	import { trapFocus, type Trap } from '$lib/utils/trapFocus.js';
	import { colord, type Colord, type HsvaColor, type RgbaColor } from 'colord';
	import { tick } from 'svelte';
	import { Slider } from 'svelte-awesome-slider';
	import Picker from './Picker.svelte';
	import Input from './variant/default/Input.svelte';
	import NullabilityCheckbox from './variant/default/NullabilityCheckbox.svelte';
	import PickerIndicator from './variant/default/PickerIndicator.svelte';
	import Swatches from './variant/default/Swatches.svelte';
	import TextInput from './variant/default/TextInput.svelte';
	import Wrapper from './variant/default/Wrapper.svelte';

	interface Props {
		/** customize the ColorPicker component parts. Can be used to display a Chrome variant or an Accessibility Notice */
		components?: Partial<Components>;
		/** input label, hidden when the ColorPicker is always shown (prop `isDialog={false}`) */
		label?: string;
		/** input name, useful in a native form */
		name?: string | undefined;
		/** if set to true, the color picker becomes nullable (rgb, hsv and hex set to undefined) */
		nullable?: boolean;
		/** rgb color */
		rgb?: RgbaColor | null;
		/** hsv color */
		hsv?: HsvaColor | null;
		/** hex color */
		hex?: string | null;
		/** Colord color */
		color?: Colord | null;
		/** indicator whether the selected color is light or dark */
		isDark?: boolean;
		/** if set to false, disables the alpha channel */
		isAlpha?: boolean;
		/** if set to false, the input and the label will not be displayed and the ColorPicker will always be visible */
		isDialog?: boolean;
		/** indicator of the popup state */
		isOpen?: boolean;
		/** if set to "responsive", the popup will adjust its x and y position depending on the available window space, "responsive-x" and "responsive-y" limit the behavior to either the x or y axis */
		position?: 'fixed' | 'responsive' | 'responsive-x' | 'responsive-y';
		/** directionality left to right, or right to left*/
		dir?: 'ltr' | 'rtl';
		/** if set to false, hide the hex, rgb and hsv text inputs */
		isTextInput?: boolean;
		/** configure which hex, rgb and hsv inputs will be visible and in which order. If overridden, it is necessary to provide at least one value */
		textInputModes?: Array<'hex' | 'rgb' | 'hsv'>;
		/** If set to "horizontal", the hue and alpha sliders will be displayed horizontally. It is necessary to set this props to "horizontal" for the ChromeVariant */
		sliderDirection?: 'horizontal' | 'vertical';
		/** If set to true, it will not be possible to close the color picker by clicking outside */
		disableCloseClickOutside?: boolean;
		/** used with the A11yVariant. Define the accessibility examples in the color picker */
		a11yColors?: Array<A11yColor>;
		/** required WCAG contrast level */
		a11yLevel?: 'AA' | 'AAA';
		/** all translation tokens used in the library; can be partially overridden; see [full object type](https://github.com/Ennoriel/svelte-awesome-color-picker/blob/master/src/lib/utils/texts.ts) */
		texts?: TextsPartial | undefined;
		/** all a11y translation tokens used in the library; override with translations if necessary; see [full object type](https://github.com/Ennoriel/svelte-awesome-color-picker/blob/master/src/lib/utils/texts.ts) */
		a11yTexts?: A11yTextsPartial | undefined;
		/** listener, dispatch an event when the color changes */
		onInput?:
			| ((color: { hsv: HsvaColor | null; rgb: RgbaColor | null; hex: string | null; color: Colord | null }) => void)
			| undefined;
		/** Optional array of color swatches to display below the picker */
		swatches?: string[];
	}

	let {
		components = {},
		label = 'Choose a color',
		name = undefined,
		nullable = false,
		rgb = $bindable<RgbaColor | null>(nullable ? null : { r: 255, g: 0, b: 0, a: 1 }),
		hsv = $bindable<HsvaColor | null>(nullable ? null : { h: 0, s: 100, v: 100, a: 1 }),
		hex = $bindable<string | null>(nullable ? null : '#ff0000'),
		color = $bindable(null),
		isDark = $bindable(false),
		isAlpha = true,
		isDialog = true,
		isOpen = $bindable(!isDialog),
		position = 'responsive',
		dir = 'ltr',
		isTextInput = true,
		textInputModes = ['hex', 'rgb', 'hsv'],
		sliderDirection = 'vertical',
		disableCloseClickOutside = false,
		a11yColors = [{ bgHex: '#ffffff' }],
		a11yLevel = 'AA',
		texts = undefined,
		a11yTexts = undefined,
		onInput,
		swatches
	}: Props = $props();

	/**
	 * Internal old values to trigger color conversion
	 */
	let _rgb: RgbaColor = $state({ r: 255, g: 0, b: 0, a: 1 });
	let _hsv: HsvaColor = $state({ h: 0, s: 100, v: 100, a: 1 });
	let _hex: string = $state('#ff0000');

	let isUndefined = $state(false);
	// svelte-ignore state_referenced_locally
	let _isUndefined = $state(isUndefined);

	let spanElement: HTMLSpanElement | undefined = $state();
	let labelElement: HTMLLabelElement | undefined = $state();
	let wrapper: HTMLElement | undefined = $state();

	let trap: Trap | undefined = undefined;

	let innerWidth: number = $state(1080);
	let innerHeight: number = $state(720);
	const wrapperPadding: number = 12;

	const default_components: Components = {
		pickerIndicator: PickerIndicator,
		textInput: TextInput,
		input: Input,
		nullabilityCheckbox: NullabilityCheckbox,
		wrapper: Wrapper
	};

	function getComponents() {
		return {
			...default_components,
			...components
		};
	}

	function getTexts() {
		return {
			label: {
				...defaultTexts.label,
				...texts?.label
			},
			color: {
				...defaultTexts.color,
				...texts?.color
			},
			changeTo: texts?.changeTo ?? defaultTexts.changeTo,
			swatch: {
				...texts?.swatch,
				...defaultTexts.swatch
			}
		};
	}

	function mousedown({ target }: MouseEvent) {
		if (isDialog) {
			if (labelElement?.contains(target as Node) || labelElement?.isSameNode(target as Node)) {
				isOpen = !isOpen;
			} else if (isOpen && !wrapper?.contains(target as Node) && !disableCloseClickOutside) {
				isOpen = false;
			}
		}
	}

	function keyup({ key, target }: KeyboardEvent) {
		if (!isDialog || !labelElement || !spanElement) {
			return;
		} else if (key === 'Enter' && labelElement.contains(target as Node)) {
			isOpen = !isOpen;
			setTimeout(() => {
				if (wrapper) trap = trapFocus(wrapper);
			});
		} else if (key === 'Escape' && isOpen) {
			isOpen = false;
			if (spanElement.contains(target as Node)) {
				labelElement?.focus();
				trap?.destroy();
			}
		}
	}

	function selectSwatch(color: string) {
		hex = color;
		hsv = colord(color).toHsv();
		rgb = colord(color).toRgb();

		_isUndefined = false;
		isUndefined = false;
		updateColor();
	}

	function hasColorChanged() {
		return !(
			hsv &&
			rgb &&
			hsv.h === _hsv.h &&
			hsv.s === _hsv.s &&
			hsv.v === _hsv.v &&
			hsv.a === _hsv.a &&
			rgb.r === _rgb.r &&
			rgb.g === _rgb.g &&
			rgb.b === _rgb.b &&
			rgb.a === _rgb.a &&
			hex === _hex
		);
	}

	/**
	 * using a function seems to trigger the exported value change only once when all of them has been updated
	 * and not just after the hsv change
	 */
	function updateColor() {
		if (isUndefined && !_isUndefined) {
			_isUndefined = true;
			hsv = null;
			rgb = null;
			hex = null;
			onInput?.({ color, hsv, rgb, hex });
			return;
		} else if (_isUndefined && !isUndefined) {
			_isUndefined = false;
			hsv = $state.snapshot(_hsv);
			rgb = $state.snapshot(_rgb);
			hex = $state.snapshot(_hex);
			onInput?.({ color, hsv, rgb, hex });
			return;
		} else if (!hsv && !rgb && !hex) {
			isUndefined = _isUndefined = true;
			onInput?.({ color: null, hsv, rgb, hex });
			return;
		} else if (!hasColorChanged()) {
			return;
		}

		isUndefined = false;

		// reinitialize empty alpha values
		if (hsv && hsv.a === undefined) hsv = { ...hsv, a: 1 };
		if (_hsv.a === undefined) _hsv = { ..._hsv, a: 1 };
		if (rgb && rgb.a === undefined) rgb = { ...rgb, a: 1 };
		if (_rgb.a === undefined) _rgb = { ..._rgb, a: 1 };
		if (hex?.substring(7) === 'ff') hex = hex.substring(0, 7);
		if (_hex?.substring(7) === 'ff') _hex = _hex.substring(0, 7);

		// triggers color computation from the color that changed or if it is the only color defined
		if (hsv && (hsv.h !== _hsv.h || hsv.s !== _hsv.s || hsv.v !== _hsv.v || hsv.a !== _hsv.a || (!rgb && !hex))) {
			color = colord(hsv);
			rgb = color.toRgb();
			hex = color.toHex();
		} else if (
			rgb &&
			(rgb.r !== _rgb.r || rgb.g !== _rgb.g || rgb.b !== _rgb.b || rgb.a !== _rgb.a || (!hsv && !hex))
		) {
			color = colord(rgb);
			hex = color.toHex();
			hsv = color.toHsv();
		} else if (hex && (hex !== _hex || (!hsv && !rgb))) {
			color = colord(hex);
			rgb = color.toRgb();
			hsv = color.toHsv();
		}

		if (color) {
			isDark = color.isDark();
		}

		if (!hex || !hsv || !rgb) return;

		// update old colors
		_hsv = $state.snapshot(hsv);
		_rgb = $state.snapshot(rgb);
		_hex = hex;
		_isUndefined = isUndefined;

		onInput?.({ color, hsv, rgb, hex });
	}

	$effect(() => {
		if (hsv || rgb || hex) updateColor();
	});

	$effect(() => {
		isUndefined;
		updateColor();
	});

	function updateLetter(letter: 'h' | 'a') {
		return (letterValue: number) => {
			if (!hsv) {
				isUndefined = false;
				_isUndefined = false;
				hsv = $state.snapshot(_hsv);
			}
			hsv = {
				...hsv,
				[letter]: letterValue
			};
		};
	}

	function updateLetters<T extends Array<'h' | 's' | 'v'>>(letters: T) {
		return (color: Pick<HsvaColor, T[number]>) => {
			if (!hsv) {
				isUndefined = false;
				_isUndefined = false;
				hsv = $state.snapshot(_hsv);
			}
			hsv = {
				...hsv,
				...Object.fromEntries(letters.map((letter: T[number]) => [letter, color[letter]]))
			};
		};
	}

	async function wrapperBoundaryCheck() {
		await tick();

		if (position === 'fixed' || !isOpen || !isDialog || !labelElement || !wrapper) return;

		const wrapperRect = wrapper.getBoundingClientRect();
		const labelRect = labelElement.getBoundingClientRect();

		if (position === 'responsive' || position === 'responsive-y') {
			const isWrapperToLow = labelRect.top + wrapperRect.height + wrapperPadding > innerHeight;
			if (isWrapperToLow) {
				wrapper.style.top = `-${wrapperRect.height + wrapperPadding}px`;
			} else {
				wrapper.style.top = `${labelRect.height + wrapperPadding}px`;
			}
		}

		if (position === 'responsive' || position === 'responsive-x') {
			if (dir === 'rtl') {
				const isWrapperToLeft = labelRect.left + labelRect.width - wrapperRect.width < 0;
				console.log(isWrapperToLeft, labelRect.left - wrapperRect.width, labelRect.left, wrapperRect.width);
				if (isWrapperToLeft) {
					wrapper.style.left = `0px`;
				} else {
					wrapper.style.left = `${labelRect.width - wrapperRect.width}px`;
				}
			} else {
				const isWrapperToRight = labelRect.left + wrapperRect.width > innerWidth;
				if (isWrapperToRight) {
					wrapper.style.left = `${labelRect.width - wrapperRect.width}px`;
				} else {
					wrapper.style.left = `0px`;
				}
			}
		}
	}

	$effect(() => {
		if (innerWidth && innerHeight && isOpen) wrapperBoundaryCheck();
	});

	const CPComponents = $derived(getComponents());
</script>

<svelte:window
	onmousedown={mousedown}
	onkeyup={keyup}
	onscroll={wrapperBoundaryCheck}
	bind:innerWidth
	bind:innerHeight
/>

<span bind:this={spanElement} class="color-picker {sliderDirection}">
	{#if isDialog}
		<CPComponents.input bind:labelElement {hex} {label} {name} {dir} />
	{:else if name}
		<input type="hidden" value={hex} {name} />
	{/if}
	<CPComponents.wrapper bind:wrapper {isOpen} {isDialog}>
		{#if nullable}
			<CPComponents.nullabilityCheckbox bind:isUndefined texts={getTexts()} />
		{/if}
		<Picker
			components={getComponents()}
			h={hsv?.h ?? _hsv.h}
			s={hsv?.s ?? _hsv.s}
			v={hsv?.v ?? _hsv.v}
			onInput={updateLetters(['s', 'v'])}
			{isDark}
			texts={getTexts()}
		/>
		<div class="h">
			<Slider
				min={0}
				max={360}
				step={1}
				value={hsv?.h ?? _hsv.h}
				onInput={updateLetter('h')}
				direction={sliderDirection}
				reverse={sliderDirection === 'vertical'}
				ariaLabel={getTexts().label.h}
			/>
		</div>
		{#if isAlpha}
			<div class="a" style:--alphaless-color={(hex ? hex : _hex).substring(0, 7)}>
				<Slider
					min={0}
					max={1}
					step={0.01}
					value={hsv?.a ?? _hsv.a}
					onInput={updateLetter('a')}
					direction={sliderDirection}
					reverse={sliderDirection === 'vertical'}
					ariaLabel={getTexts().label.a}
				/>
			</div>
		{/if}

		{#if swatches && swatches.length > 0}
			<Swatches {swatches} {selectSwatch} texts={getTexts()} />
		{/if}

		{#if isTextInput}
			<CPComponents.textInput
				hex={hex ?? _hex}
				rgb={rgb ?? _rgb}
				hsv={hsv ?? _hsv}
				onInput={(color) => {
					if (color.hsv) {
						hsv = color.hsv;
					} else if (color.rgb) {
						rgb = color.rgb;
					} else if (color.hex) {
						hex = color.hex;
					}
				}}
				{isAlpha}
				{textInputModes}
				texts={getTexts()}
			/>
		{/if}
		{#if getComponents().a11yNotice}
			<CPComponents.a11yNotice
				components={getComponents()}
				{a11yColors}
				hex={hex || '#00000000'}
				{a11yTexts}
				{a11yLevel}
			/>
		{/if}
	</CPComponents.wrapper>
</span>

<!-- 
@component Color Picker Component — default export of the library

**Import**
```js
import ColorPicker from 'svelte-awesome-color-picker';
```

**Use**
```svelte
<ColorPicker bind:hex />
```

**Props**
@prop components: Partial&lt;Components&gt; = {} — customize the ColorPicker component parts. Can be used to display a Chrome variant or an Accessibility Notice
@prop label: string = 'Choose a color' — input label, hidden when the ColorPicker is always shown (prop `isDialog={false}`)
@prop name: string | undefined = undefined — input name, useful in a native form
@prop nullable: boolean = false — if set to true, the color picker becomes nullable (rgb, hsv and hex set to undefined)
@prop rgb: RgbaColor | null — rgb color
@prop hsv: HsvaColor | null — hsv color
@prop hex: string | null — hex color
@prop color: Colord | null = null — Colord color
@prop isDark: boolean = false — indicator whether the selected color is light or dark
@prop isAlpha: boolean = true — if set to false, disables the alpha channel
@prop isDialog: boolean = true — if set to false, the input and the label will not be displayed and the ColorPicker will always be visible
@prop isOpen: boolean = !isDialog — indicator of the popup state
@prop position: 'fixed' | 'responsive' | 'responsive-x' | 'responsive-y' = 'responsive' — if set to "responsive", the popup will adjust its x and y position depending on the available window space, "responsive-x" and "responsive-y" limit the behavior to either the x or y axis
@prop dir: 'ltr' | 'rtl' = 'ltr' — directionality left to right, or right to left
@prop isTextInput: boolean = true — if set to false, hide the hex, rgb and hsv text inputs
@prop textInputModes: Array&lt;'hex' | 'rgb' | 'hsv'&gt; = ['hex', 'rgb', 'hsv'] — configure which hex, rgb and hsv inputs will be visible and in which order. If overridden, it is necessary to provide at least one value
@prop sliderDirection: 'horizontal' | 'vertical' = 'vertical' — If set to "horizontal", the hue and alpha sliders will be displayed horizontally. It is necessary to set this props to "horizontal" for the ChromeVariant
@prop disableCloseClickOutside: boolean = false — If set to true, it will not be possible to close the color picker by clicking outside
@prop a11yColors: Array&lt;A11yColor&gt; = [{ bgHex: '#ffffff' }] — used with the A11yVariant. Define the accessibility examples in the color picker
@prop a11yLevel: 'AA' | 'AAA' = 'AA' — required WCAG contrast level
@prop texts: TextsPartial | undefined = undefined — all translation tokens used in the library; can be partially overridden; see [full object type](https://github.com/Ennoriel/svelte-awesome-color-picker/blob/master/src/lib/utils/texts.ts)
@prop a11yTexts: A11yTextsPartial | undefined = undefined — all a11y translation tokens used in the library; override with translations if necessary; see [full object type](https://github.com/Ennoriel/svelte-awesome-color-picker/blob/master/src/lib/utils/texts.ts)
@prop onInput: ((color: { hsv: HsvaColor | null; rgb: RgbaColor | null; hex: string | null; color: Colord | null }) =&gt; void) | undefined — listener, dispatch an event when the color changes
@prop swatches: string[] — Optional array of color swatches to display below the picker
-->
<style>
	span {
		position: relative;
		color: var(--cp-text-color, var(--cp-border-color));

		--alpha-grid-bg:
			linear-gradient(45deg, #eee 25%, #0000 25%, #0000 75%, #eee 75%) 0 0 / 10px 10px,
			linear-gradient(45deg, #eee 25%, #0000 25%, #0000 75%, #eee 75%) 5px 5px / 10px 10px;
	}

	.h,
	.a {
		display: inline-flex;
		justify-content: center;
		--track-height: var(--slider-width, 10px);
		--track-width: var(--picker-height, 200px);
		--track-border: none;
		--thumb-size: calc(var(--slider-width, 10px) - 3px);
		--thumb-background: white;
		--thumb-border: 1px solid black;
		--margin-block: 0;

		--gradient-direction: 0.5turn;
	}
	.horizontal .h,
	.horizontal .a {
		--track-width: calc(var(--picker-width, 200px) - 12px);

		--gradient-direction: 0.25turn;
		margin: 4px 6px;
	}
	.horizontal .h {
		margin-top: 8px;
	}
	.vertical .h,
	.vertical .a {
		margin-left: 3px;
	}

	.h {
		grid-area: hue;

		--gradient-hue:
			#ff1500fb, #ffff00 17.2%, #ffff00 18.2%, #00ff00 33.3%, #00ffff 49.5%, #00ffff 51.5%, #0000ff 67.7%,
			#ff00ff 83.3%, #ff0000;
		--track-background: linear-gradient(var(--gradient-direction), var(--gradient-hue));
	}

	.a {
		grid-area: alpha;
		margin-top: 2px;

		/* redefine css variable as it may not be available in case of a portal */
		--alpha-grid-bg:
			linear-gradient(45deg, #eee 25%, #0000 25%, #0000 75%, #eee 75%) 0 0 / 10px 10px,
			linear-gradient(45deg, #eee 25%, #0000 25%, #0000 75%, #eee 75%) 5px 5px / 10px 10px;

		--track-background:
			linear-gradient(var(--gradient-direction), rgba(0, 0, 0, 0), var(--alphaless-color)), var(--alpha-grid-bg);
	}

	span :global(.sr-only) {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
