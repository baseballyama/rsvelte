<script lang="ts">
	import { cn } from '$lib/utils.js';

	import { Switch as SwitchPrimitive } from 'bits-ui';

	let {
		checked = $bindable(false),
		class: className,
		ref = $bindable(null),
		...restProps
	}: SwitchPrimitive.RootProps = $props();
</script>

<SwitchPrimitive.Root
	bind:ref
	bind:checked
	class={cn(
		'peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:ring-ring/50 inline-flex h-6 w-10 shrink-0 items-center rounded-full border-2 border-transparent transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	{...restProps}
>
	<SwitchPrimitive.Thumb
		class={cn(
			'bg-background pointer-events-none block size-5 rounded-full shadow-xs ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 data-[state=checked]:rtl:-translate-x-4'
		)}
	/>
</SwitchPrimitive.Root>
