<script lang="ts" module>
	import type { ToggleVariants } from '$lib/components/ui/toggle.svelte';

	import { getContext, setContext } from 'svelte';

	export function setToggleGroupCtx(props: ToggleVariants) {
		setContext('toggleGroup', props);
	}

	export function getToggleGroupCtx() {
		return getContext<ToggleVariants>('toggleGroup');
	}
</script>

<script lang="ts">
	import { cn } from '$lib/utils.js';

	import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui';

	let {
		class: className,
		ref = $bindable(null),
		size = 'default',
		value = $bindable(),
		variant = 'default',
		...restProps
	}: ToggleGroupPrimitive.RootProps & ToggleVariants = $props();

	setToggleGroupCtx({
		size,
		variant
	});
</script>

<ToggleGroupPrimitive.Root
	bind:value={value as never}
	bind:ref
	class={cn(
		'group/toggle-group flex items-center rounded-md data-[variant=outline]:shadow-2xs',
		className
	)}
	{...restProps}
/>
