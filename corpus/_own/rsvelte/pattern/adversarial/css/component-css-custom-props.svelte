<script>
	import Slider from './Slider.svelte';

	let accent = $state('#ff3e00');
</script>

<Slider --track-color={accent} --thumb-size="1rem" --rail="linear-gradient(red, blue)" />

<svg width="10" height="10">
	<Slider --svg-scoped="2px" />
</svg>
