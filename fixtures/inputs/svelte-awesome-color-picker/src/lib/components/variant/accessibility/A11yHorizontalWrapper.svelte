<script lang="ts">
	export interface Props {
		/** DOM element of the Color Picker popup wrapper */
		wrapper: HTMLElement;
		/** indicator of the popup state */
		isOpen: boolean;
		/** if set to true, the wrapper should have a dialog role and be absolute. It should be relative otherwise */
		isDialog: boolean;
		/** children */
		children: import('svelte').Snippet;
	}

	let { wrapper = $bindable(), isOpen, isDialog, children }: Props = $props();
</script>

<div
	class="wrapper"
	bind:this={wrapper}
	class:is-open={isOpen}
	role={isDialog ? 'dialog' : undefined}
	aria-label="color picker"
>
	{@render children()}
</div>

<!-- 
@component Accessibility horizontal wrapper — this component is meant to be used with the A11yVariant object as a variant to display the accessibility notice.

**Import**
```js
import { A11yVariant } from 'svelte-awesome-color-picker';
```

**Use**
```svelte
<ColorPicker bind:hex components={A11yVariant} />
```

**Props**
@prop wrapper: HTMLElement — DOM element of the Color Picker popup wrapper
@prop isOpen: boolean — indicator of the popup state
@prop isDialog: boolean — if set to true, the wrapper should have a dialog role and be absolute. It should be relative otherwise
@prop children: import('svelte').Snippet — children
-->
<style>
	div {
		padding: 6px;
		background-color: var(--cp-bg-color, white);
		margin: 0 10px 10px;
		border: 1px solid var(--cp-border-color, black);
		border-radius: 12px;
		display: none;
		width: max-content;
	}
	.is-open {
		display: block;
	}
	@media (min-width: 768px) {
		.is-open {
			display: grid;
			gap: 5px;
			grid-template:
				'nullable . . .'
				'picker hue alpha a11y'
				'input input input a11y';
			grid-template-rows: auto var(--picker-height, 200px) auto;
		}
	}

	div :global(.picker) {
		grid-area: picker;
	}

	div :global(.text-input) {
		grid-area: input;
	}

	div :global(.a11y-notice) {
		grid-area: a11y;
		margin: 0 4px 0 6px;
	}

	[role='dialog'] {
		position: absolute;
		top: calc(var(--input-size, 25px) + 12px);
		left: 0;
		z-index: var(--picker-z-index, 2);
	}
</style>
