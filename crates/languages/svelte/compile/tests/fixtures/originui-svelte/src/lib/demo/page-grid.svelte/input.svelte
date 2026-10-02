<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="overflow-hidden">
	<div
		class="-m-px grid grid-cols-12 *:px-1 *:py-12 sm:*:px-8 xl:*:px-12 [&_>*:not(:first-child)]:-ms-px [&_>*:not(:first-child)]:-mt-px"
	>
		{@render children()}
	</div>
</div>
