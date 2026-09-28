<script lang="ts">
	import type { Texts } from '$lib/utils/texts.js';

	interface Props {
		/** Optional array of color swatches to display */
		swatches?: string[];
		/** listener, dispatch an event when the user select a swatch color */
		selectSwatch: (color: string) => void;
		/** all translation tokens used in the library; can be partially overridden; see [full object type](https://github.com/Ennoriel/svelte-awesome-color-picker/blob/master/src/lib/utils/texts.ts) */
		texts: Texts;
	}

	let { selectSwatch, swatches, texts }: Props = $props();
</script>

{#if swatches}
	<div class="swatches" aria-label={texts.swatch.ariaTitle}>
		{#each swatches as color (color)}
			<button
				type="button"
				class="swatch"
				style="background: {color}"
				aria-label={texts.swatch.ariaLabel(color)}
				onclick={() => selectSwatch(color)}
			></button>
		{/each}
	</div>
{/if}

<style>
	.swatches {
		display: grid;
		grid-template-columns: var(--cp-swatch-grid-template-columns, repeat(auto-fit, minmax(24px, 1fr)));
		gap: 8px;
		width: 100%;
		height: 100%;
		margin-top: 8px;
		margin-bottom: 8px;
	}
	.swatch {
		cursor: pointer;
		margin: 0;
		padding: 0;
		border: none;
		width: 100%;
		aspect-ratio: 1 / 1;
		height: auto;
		display: block;
	}
	.swatch:focus {
		outline: 2px solid var(--focus-color, red);
		outline-offset: 2px;
	}
</style>
