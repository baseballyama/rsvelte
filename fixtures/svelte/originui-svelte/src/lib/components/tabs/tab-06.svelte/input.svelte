<script lang="ts">
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
</script>

<Tabs value="tab-1" class="items-center">
	<TabsList
		class="bg-background h-auto -space-x-px p-0 shadow-xs shadow-black/5 rtl:space-x-reverse"
	>
		<TabsTrigger
			value="tab-1"
			class="border-border data-[state=active]:bg-muted data-[state=active]:after:bg-primary relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e"
		>
			Tab 1
		</TabsTrigger>
		<TabsTrigger
			value="tab-2"
			class="border-border data-[state=active]:bg-muted data-[state=active]:after:bg-primary relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e"
		>
			Tab 2
		</TabsTrigger>
		<TabsTrigger
			value="tab-3"
			class="border-border data-[state=active]:bg-muted data-[state=active]:after:bg-primary relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e"
		>
			Tab 3
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
