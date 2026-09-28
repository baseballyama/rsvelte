<script lang="ts">
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
</script>

<Tabs value="tab-1" orientation="vertical" class="w-full flex-row">
	<TabsList class="flex-col gap-1 bg-transparent py-0">
		<TabsTrigger
			value="tab-1"
			class="data-[state=active]:bg-muted w-full justify-start data-[state=active]:shadow-none"
		>
			Overview
		</TabsTrigger>
		<TabsTrigger
			value="tab-2"
			class="data-[state=active]:bg-muted w-full justify-start data-[state=active]:shadow-none"
		>
			Repositories
		</TabsTrigger>
		<TabsTrigger
			value="tab-3"
			class="data-[state=active]:bg-muted w-full justify-start data-[state=active]:shadow-none"
		>
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
