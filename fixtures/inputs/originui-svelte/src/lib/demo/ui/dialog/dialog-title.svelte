<script lang="ts">
	import { cn } from '$lib/utils.js';

	import { Dialog as DialogPrimitive, type DialogTitleProps } from 'bits-ui';

	let { class: className, ref = $bindable(null), ...restProps }: DialogTitleProps = $props();
</script>

<DialogPrimitive.Title
	bind:ref
	class={cn('text-lg leading-none font-semibold tracking-tight', className)}
	{...restProps}
/>
