<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import Bolt from '@lucide/svelte/icons/bolt';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import CopyPlus from '@lucide/svelte/icons/copy-plus';
	import Files from '@lucide/svelte/icons/files';
	import Layers2 from '@lucide/svelte/icons/layers-2';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdowns';
</script>

<DropdownMenu>
	<DropdownMenuTrigger>
		{#snippet child({ props })}
			<Button variant="outline" {...props}>
				Menu with icons

				<ChevronDown class="-me-1 opacity-60" size={16} aria-hidden="true" />
			</Button>
		{/snippet}
	</DropdownMenuTrigger>
	<DropdownMenuContent>
		<DropdownMenuItem>
			<CopyPlus size={16} class="opacity-60" aria-hidden="true" />
			Copy
		</DropdownMenuItem>
		<DropdownMenuItem>
			<Bolt size={16} class="opacity-60" aria-hidden="true" />
			Edit
		</DropdownMenuItem>
		<DropdownMenuItem>
			<Layers2 size={16} class="opacity-60" aria-hidden="true" />
			Group
		</DropdownMenuItem>
		<DropdownMenuItem>
			<Files size={16} class="opacity-60" aria-hidden="true" />
			Clone
		</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
