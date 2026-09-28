<script lang="ts">
	import type { AvailableOUIComponent } from '$data/api/components/components.handler';
	import type { HTMLAttributes } from 'svelte/elements';

	import CodePreview from '../code-preview.svelte';
	import ComponentDependency from '../component-dependency.svelte';
	import GotoComponentButton from '../component-goto-button.svelte';
	import CopyButton from '../copy-button.svelte';
	import ShareButton from '../share-button.svelte';

	import Box from '@lucide/svelte/icons/box';
	import Code from '@lucide/svelte/icons/code';
	import Folder from '@lucide/svelte/icons/folder';
	import FolderTree from '@lucide/svelte/icons/folder-tree';
	import { page } from '$app/state';
	import * as Tab from '$lib/components/ui/tabs';
	import { tick } from 'svelte';

	type PropsComponentPreview = HTMLAttributes<HTMLDivElement> & {
		component: AvailableOUIComponent;
		isSinglePage?: false;
		onGotoComponent?: (e: MouseEvent) => void;
	};

	type PropsSinglePage = HTMLAttributes<HTMLDivElement> & {
		component: AvailableOUIComponent;
		isSinglePage: true;
		onGotoComponent?: never;
	};

	type Props = PropsComponentPreview | PropsSinglePage;

	let { component, isSinglePage = false, onGotoComponent, ...restProps }: Props = $props();

	let dialogRef: HTMLDivElement | null = $state(null);
	let wrapperRef: HTMLDivElement | null = $state(null);

	const handleTabChange = () => {
		tick().then(() => {});
	};
</script>

<div class="flex flex-col gap-4 px-4 pb-4" {...restProps}>
	<div class="space-y-2">
		<div class="flex items-center gap-2">
			<h2 class="text-2xl font-bold">
				{component.name}
			</h2>
			<ShareButton {component} />
			{#if !isSinglePage}
				<GotoComponentButton
					description="Go to the {component.name} component"
					href="{page.url.href}/{component.id}"
					onclick={onGotoComponent}
				/>
			{/if}
		</div>
		<div class="flex flex-col gap-1">
			<div class="text-muted-foreground text-sm">
				<Folder class="inline-block" size={16} aria-hidden="true" />
				<span>Directory:</span>
				<span>
					{component.directory}
				</span>
			</div>
			<div class="text-muted-foreground text-sm">
				<FolderTree class="inline-block" size={16} aria-hidden="true" />
				<span>Path:</span>
				<span>
					{component.path}
				</span>
			</div>
		</div>
	</div>

	{#if isSinglePage}
		<div class="bg-background flex scale-90 flex-col items-center gap-4 rounded-lg border p-6">
			<component.Component />
		</div>
	{/if}

	<div class=" flex flex-col gap-4">
		<Tab.Tabs value="code" onValueChange={handleTabChange}>
			<Tab.TabsList>
				<Tab.TabsTrigger value="code">
					<Code class="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
					Code
				</Tab.TabsTrigger>
				{#if component.componentDependencies.list.length > 0}
					<Tab.TabsTrigger value="dependencies">
						<Box class="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
						Dependencies
					</Tab.TabsTrigger>
				{/if}
			</Tab.TabsList>
			<div
				bind:this={wrapperRef}
				class="overflow-hidden transition-[height] duration-300 ease-[cubic-bezier(0.4,_0,_0.2,_1)]"
			>
				<div bind:this={dialogRef}>
					<Tab.TabsContent value="code" class="relative pt-4">
						<CopyButton class="absolute top-4 right-2" code={component.code.raw.content} />
						<CodePreview
							class="bg-muted overflow-y-auto rounded-lg py-4 [&_pre]:data-[component=false]:max-h-[440px] [&_pre]:data-[component=true]:max-h-[calc(100svh-25rem)]"
							code={component.code.highlighted.content}
							data-component={isSinglePage ? true : false}
						/>
					</Tab.TabsContent>
					{#if component.componentDependencies.list.length > 0}
						<Tab.TabsContent value="dependencies">
							<div class="grid grid-cols-2 gap-4 pt-4">
								{#each component.componentDependencies.list as dependency (dependency.name)}
									<ComponentDependency {dependency} />
								{/each}
							</div>
						</Tab.TabsContent>
					{/if}
				</div>
			</div>
		</Tab.Tabs>
	</div>
</div>
