<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';

	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
</script>

<Tabs value="tab-1" class="items-center">
	<TabsList class="mx-auto flex max-w-xs bg-transparent">
		<TabsTrigger
			value="tab-1"
			class="group data-[state=active]:bg-muted flex-1 flex-col p-3 text-xs data-[state=active]:shadow-none"
		>
			<Badge class="mb-1.5 min-w-5 px-1 transition-opacity group-data-[state=inactive]:opacity-50">
				3
			</Badge>
			Overview
		</TabsTrigger>
		<TabsTrigger
			value="tab-2"
			class="group data-[state=active]:bg-muted flex-1 flex-col p-3 text-xs data-[state=active]:shadow-none"
		>
			<Badge class="mb-1.5 min-w-5 px-1 transition-opacity group-data-[state=inactive]:opacity-50">
				0
			</Badge>
			Repositories
		</TabsTrigger>
		<TabsTrigger
			value="tab-3"
			class="group data-[state=active]:bg-muted flex-1 flex-col p-3 text-xs data-[state=active]:shadow-none"
		>
			<Badge class="mb-1.5 min-w-5 px-1 transition-opacity group-data-[state=inactive]:opacity-50">
				7
			</Badge>
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
