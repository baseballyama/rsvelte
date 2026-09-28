<script lang="ts">
	import { bgColor } from './store.js';

	import './style/style.css';
	import './style/code.css';

	interface Props {
		/** children */
		children: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div style:padding="8px" style:background-color={$bgColor}>
	{@render children()}
</div>
