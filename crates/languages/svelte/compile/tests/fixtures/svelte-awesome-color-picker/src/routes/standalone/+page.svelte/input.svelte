<script lang="ts">
	import ColorPicker, { A11yVariant, type RgbaColor, type HsvaColor } from '$lib';

	let hex = $state('#f6f0dc');
	let rgb = $state<RgbaColor | null>(null);
	let hsv = $state<HsvaColor | null>(null);
</script>

<h1 style:margin-bottom="24px">color picker debug screen</h1>

<div style:margin="auto" style:width="fit-content">
	<ColorPicker
		components={A11yVariant}
		bind:hex
		bind:rgb
		bind:hsv
		nullable
		isAlpha
		isDialog={false}
		a11yLevel="AAA"
		a11yColors={[
			{ textHex: '#FFF', reverse: true, placeholder: 'background' },
			{ textHex: '#FFF', bgHex: '#FF0000', reverse: true, placeholder: 'background /w alpha' },
			{ bgHex: '#FFF', placeholder: 'title', size: 'large' },
			{ bgHex: '#7F7F7F', placeholder: 'button' }
		]}
	/>
</div>
