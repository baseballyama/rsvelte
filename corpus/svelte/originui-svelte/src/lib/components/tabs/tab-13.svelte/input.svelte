<script lang="ts">
	import Box from '@lucide/svelte/icons/box';
	import House from '@lucide/svelte/icons/house';
	import PanelsTopLeft from '@lucide/svelte/icons/panels-top-left';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
</script>

<Tabs value="tab-1" class="items-center">
	<TabsList class="border-border h-auto rounded-none border-b bg-transparent p-0">
		<TabsTrigger
			value="tab-1"
			class="data-[state=active]:after:bg-primary relative flex-col rounded-none px-4 py-2 text-xs after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
		>
			<House class="mb-1.5 opacity-60" size={16} aria-hidden="true" />
			Overview
		</TabsTrigger>
		<TabsTrigger
			value="tab-2"
			class="data-[state=active]:after:bg-primary relative flex-col rounded-none px-4 py-2 text-xs after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
		>
			<PanelsTopLeft class="mb-1.5 opacity-60" size={16} aria-hidden="true" />
			Repositories
		</TabsTrigger>
		<TabsTrigger
			value="tab-3"
			class="data-[state=active]:after:bg-primary relative flex-col rounded-none px-4 py-2 text-xs after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
		>
			<Box class="mb-1.5 opacity-60" size={16} aria-hidden="true" />
			Packages
		</TabsTrigger>
	</TabsList>
	<TabsContent value="tab-1">
		<p class="text-muted-foreground p-4 text-center text-xs">Content for Tab 1</p>
	</TabsContent>
	<TabsContent value="tab-2">
		<p class="text-muted-foreground p-4 text-center text-xs">Content for Tab 2</p>
	</TabsContent>
	<TabsContent value="tab-3">
		<p class="text-muted-foreground p-4 text-center text-xs">Content for Tab 3</p>
	</TabsContent>
</Tabs>
