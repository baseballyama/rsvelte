<script lang="ts">
	import type {
		Command as CommandPrimitive,
		Dialog as DialogPrimitive,
		WithoutChildrenOrChild
	} from 'bits-ui';
	import type { Snippet } from 'svelte';

	import Command from './command.svelte';

	import * as Dialog from '$lib/components/ui/dialog';

	let {
		children,
		open = $bindable(false),
		portalProps,
		ref = $bindable(null),
		value = $bindable(''),
		...restProps
	}: WithoutChildrenOrChild<DialogPrimitive.RootProps> &
		WithoutChildrenOrChild<CommandPrimitive.RootProps> & {
			children: Snippet;
			portalProps?: DialogPrimitive.PortalProps;
		} = $props();
</script>

<Dialog.Root bind:open {...restProps}>
	<Dialog.Content
		class="overflow-hidden p-0 sm:max-w-lg [&>button:last-child]:hidden"
		{portalProps}
	>
		<Command
			class="**:data-command-group-heading:text-muted-foreground **:data-command-group:px-2 **:data-command-group-heading:px-2 **:data-command-group-heading:font-medium **:data-command-input:h-12  **:data-command-item:px-3 **:data-command-item:py-2 "
			{...restProps}
			bind:value
			bind:ref
			{children}
		/>
	</Dialog.Content>
</Dialog.Root>
