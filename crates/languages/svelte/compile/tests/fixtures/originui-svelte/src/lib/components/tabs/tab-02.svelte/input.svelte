<script lang="ts">
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
</script>

<Tabs value="tab-1" class="items-center">
	<TabsList class="bg-transparent">
		<TabsTrigger value="tab-1" class="data-[state=active]:bg-muted data-[state=active]:shadow-none">
			Tab 1
		</TabsTrigger>
		<TabsTrigger value="tab-2" class="data-[state=active]:bg-muted data-[state=active]:shadow-none">
			Tab 2
		</TabsTrigger>
		<TabsTrigger value="tab-3" class="data-[state=active]:bg-muted data-[state=active]:shadow-none">
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
