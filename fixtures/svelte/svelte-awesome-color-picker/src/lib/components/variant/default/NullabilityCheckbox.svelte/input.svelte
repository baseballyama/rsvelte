<script lang="ts">
	import type { Texts } from '$lib/utils/texts.js';

	interface Props {
		/** whether the color picker is undefined */
		isUndefined: boolean;
		/** all translation tokens used in the library; can be partially overridden; see [full object type](https://github.com/Ennoriel/svelte-awesome-color-picker/blob/master/src/lib/utils/texts.ts) */
		texts: Texts;
	}

	let { isUndefined = $bindable(), texts }: Props = $props();
</script>

<label class="nullability-checkbox">
	<div>
		<input type="checkbox" bind:checked={isUndefined} />
		<span></span>
	</div>
	{texts.label.withoutColor}
</label>

<style>
	label {
		display: flex;
		justify-content: center;
		margin-bottom: 4px;
		grid-area: nullable;
		user-select: none;
	}
	input {
		margin: 0;
	}
	input:focus-visible {
		outline: none;
	}
	input:focus-visible + span {
		width: 14px;
		height: 14px;
		border-radius: 2px;
		outline: 2px solid var(--focus-color, red);
		outline-offset: 2px;
	}

	div {
		width: 32px;
		aspect-ratio: 2;
		position: relative;
	}
	div * {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
