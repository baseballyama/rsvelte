<script lang="ts">
	import { cn } from '$lib/utils.js';

	import { Command as CommandPrimitive } from 'bits-ui';

	let {
		children,
		class: className,
		heading,
		ref = $bindable(null),
		...restProps
	}: CommandPrimitive.GroupProps & {
		heading?: string;
	} = $props();
</script>

<CommandPrimitive.Group
	class={cn(
		'**:data-command-group-heading:text-muted-foreground", text-foreground overflow-hidden p-2 **:data-command-group-heading:px-3 **:data-command-group-heading:py-2 **:data-command-group-heading:text-xs **:data-command-group-heading:font-medium',
		className
	)}
	bind:ref
	{...restProps}
>
	{#if heading}
		<CommandPrimitive.GroupHeading class="text-muted-foreground px-2 py-1.5 text-xs font-medium">
			{heading}
		</CommandPrimitive.GroupHeading>
	{/if}
	<CommandPrimitive.GroupItems {children} />
</CommandPrimitive.Group>
