<script lang="ts">
	interface Props {
		/** indicator position in % */
		pos: { x: number; y: number };
	}

	let { pos }: Props = $props();
</script>

<div class="picker-indicator" style:--pos-x={pos.x} style:--pos-y={pos.y}></div>

<style>
	div {
		position: absolute;
		left: calc(var(--pos-x) * (var(--picker-width, 200px) - 2px) / 100 - var(--picker-indicator-size, 10px) / 2 + 1px);
		top: calc(var(--pos-y) * (var(--picker-height, 200px) - 2px) / 100 - var(--picker-indicator-size, 10px) / 2 + 1px);

		width: var(--picker-indicator-size, 10px);
		height: var(--picker-indicator-size, 10px);
		background-color: white;
		box-shadow: 0 0 4px black;
		border-radius: 50%;

		pointer-events: none;
		z-index: 1;
		transition: box-shadow 0.2s;
	}
</style>
