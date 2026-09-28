<script lang="ts">
	import Box from '@lucide/svelte/icons/box';
	import House from '@lucide/svelte/icons/house';
	import PanelsTopLeft from '@lucide/svelte/icons/panels-top-left';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
</script>

<Tabs value="tab-1" orientation="vertical" class="w-full flex-row">
	<TabsList class="text-foreground flex-col gap-1 rounded-none bg-transparent px-1 py-0">
		<TabsTrigger
			value="tab-1"
			class="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
		>
			<House class="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
			Overview
		</TabsTrigger>
		<TabsTrigger
			value="tab-2"
			class="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
		>
			<PanelsTopLeft class="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
			Repositories
		</TabsTrigger>
		<TabsTrigger
			value="tab-3"
			class="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
		>
			<Box class="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
			Packages
		</TabsTrigger>
	</TabsList>
	<div class="border-border grow rounded-lg border text-start">
		<TabsContent value="tab-1">
			<p class="text-muted-foreground px-4 py-1.5 text-xs">Content for Tab 1</p>
		</TabsContent>
		<TabsContent value="tab-2">
			<p class="text-muted-foreground px-4 py-1.5 text-xs">Content for Tab 2</p>
		</TabsContent>
		<TabsContent value="tab-3">
			<p class="text-muted-foreground px-4 py-1.5 text-xs">Content for Tab 3</p>
		</TabsContent>
	</div>
</Tabs>
