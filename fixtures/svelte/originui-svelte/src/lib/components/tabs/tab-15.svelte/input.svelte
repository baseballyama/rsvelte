<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';

	import Box from '@lucide/svelte/icons/box';
	import House from '@lucide/svelte/icons/house';
	import PanelsTopLeft from '@lucide/svelte/icons/panels-top-left';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import {
		Tooltip,
		TooltipContent,
		TooltipProvider,
		TooltipTrigger
	} from '$lib/components/ui/tooltip';
</script>

<Tabs value="tab-1" class="items-center">
	<TabsList>
		<TooltipProvider delayDuration={0}>
			<Tooltip>
				<TooltipTrigger>
					{#snippet child({ props })}
						<span {...props}>
							<TabsTrigger value="tab-1" class="py-3">
								<House size={16} aria-hidden="true" />
							</TabsTrigger>
						</span>
					{/snippet}
				</TooltipTrigger>
				<TooltipContent class="px-2 py-1 text-xs">Overview</TooltipContent>
			</Tooltip>
		</TooltipProvider>
		<TooltipProvider delayDuration={0}>
			<Tooltip>
				<TooltipTrigger>
					{#snippet child({ props })}
						<span {...props}>
							<TabsTrigger value="tab-2" class="group py-3">
								<span class="relative">
									<PanelsTopLeft size={16} aria-hidden="true" />
									<Badge
										class="border-background absolute -top-2.5 left-full min-w-4 -translate-x-1.5 px-0.5 text-[10px]/[.875rem] transition-opacity group-data-[state=inactive]:opacity-50"
									>
										3
									</Badge>
								</span>
							</TabsTrigger>
						</span>
					{/snippet}
				</TooltipTrigger>
				<TooltipContent class="px-2 py-1 text-xs">Repositories</TooltipContent>
			</Tooltip>
		</TooltipProvider>
		<TooltipProvider delayDuration={0}>
			<Tooltip>
				<TooltipTrigger>
					{#snippet child({ props })}
						<span {...props}>
							<TabsTrigger value="tab-3" class="py-3">
								<Box size={16} aria-hidden="true" />
							</TabsTrigger>
						</span>
					{/snippet}
				</TooltipTrigger>
				<TooltipContent class="px-2 py-1 text-xs">Packages</TooltipContent>
			</Tooltip>
		</TooltipProvider>
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
