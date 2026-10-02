<script lang="ts">
	import type { AvailableOUIComponent } from '$data/api/components/components.handler.js';
	import type { ComponentProps } from 'svelte';

	import ComponentCard from '$lib/demo/component-card.svelte';
	import { getComponentDialogCtx } from '$lib/demo/component-preview/component-dialog-context.svelte.js';
	import ComponentUnavailable from '$lib/demo/component-unavailable.svelte';
	import Component from '$lib/demo/component.svelte';
	import PageGrid from '$lib/demo/page-grid.svelte';
	import PageHeader from '$lib/demo/page-header.svelte';

	let { data } = $props();

	const componentDialogCtx = getComponentDialogCtx();
	async function showComponentModal({ component }: { component: AvailableOUIComponent }) {
		componentDialogCtx.setComponent(component);
	}

	const componentLayoutMeta = $derived.by<ComponentProps<typeof ComponentCard>['meta']>(() => {
		switch (data.componentsData.meta.directory) {
			case 'accordions':
				return { layout: 'wide', style: 'default' };
			case 'alerts':
				return { layout: 'wide', style: 'default' };
			case 'avatars':
				return { layout: 'default', style: 'centered' };
			case 'badges':
				return { layout: 'default', style: 'centered' };
			case 'banners':
				return { layout: 'full', style: 'default' };
			case 'breadcrumbs':
				return { layout: 'full', style: 'centered' };
			case 'buttons':
				return { layout: 'default', style: 'centered' };
			case 'checkboxes':
				return { layout: 'default', style: 'default' };
			case 'dialogs':
				return { layout: 'default', style: 'centered' };
			case 'dropdowns':
				return { layout: 'default', style: 'centered' };
			case 'inputs':
				return { layout: 'default', style: 'default' };
			case 'navbars':
				return { layout: 'full', style: 'default' };
			case 'notifications':
				return { layout: 'wide', style: 'centered' };
			case 'paginations':
				return { layout: 'wide', overflow: true, style: 'default' };
			case 'popovers':
				return { layout: 'default', style: 'centered' };
			case 'radios':
				return { layout: 'default', style: 'default' };
			case 'selects':
				return { layout: 'default', style: 'default' };
			case 'sliders':
				return { layout: 'default', style: 'default' };
			case 'switches':
				return { layout: 'default', style: 'centered' };
			case 'tables':
				return { layout: 'full', style: 'default' };
			case 'tabs':
				return { layout: 'wide', style: 'text-center' };
			case 'timelines':
				return { layout: 'wide', style: 'default' };
			case 'tooltips':
				return { layout: 'default', style: 'centered' };
			default:
				return { layout: 'default', style: 'default' };
		}
	});
</script>

<PageHeader id="title" title={data.pageHeader.title}>
	{data.pageHeader.description}
</PageHeader>

<svelte:head>
	<title>{data.SEO.title}</title>
	<meta name="description" content={data.SEO.description} />
	<meta property="og:title" content={data.SEO.title} />
	<meta property="og:description" content={data.SEO.description} />
	<meta name="twitter:title" content={data.SEO.title} />
	<meta name="twitter:description" content={data.SEO.description} />
</svelte:head>

<PageGrid>
	{#each data.componentsData.components as { Component: RenderedComponent, ...rest } (rest.id)}
		<ComponentCard
			meta={componentLayoutMeta}
			data-component-id={rest.id}
			data-component-directory={rest.directory}
			data-component-availability={rest.availability}
		>
			{#if rest.availability === 'todo'}
				<ComponentUnavailable />
			{:else if rest.availability === 'available'}
				<Component
					componentData={rest}
					onShallowRouteClick={() => {
						if (!RenderedComponent) return;
						showComponentModal({ component: { ...rest, Component: RenderedComponent } });
					}}
				>
					<RenderedComponent />
				</Component>
			{/if}
		</ComponentCard>
	{/each}
</PageGrid>
