<script lang="ts">
	import CategoryCard from '$lib/demo/category-card.svelte';
	import Illustration from '$lib/demo/illustration.svelte';

	import { mode } from 'mode-watcher';

	let { data } = $props();
</script>

<svelte:head>
	<title>Origin UI - Svelte | Beautiful UI components built with Tailwind CSS and Svelte</title>

	<meta name="theme-color" content={$mode === 'dark' ? 'hsl(240 10% 3.9%)' : 'hsl(0 0% 100%)'} />
	<meta
		name="Description"
		content="An extensive collection of copy-and-paste Svelte components for quickly building app UIs."
	/>
	<meta name="keywords" content="svelte, component, origin ui, tailwindcss, ui, library" />

	<meta
		property="og:title"
		content="An extensive collection of copy-and-paste Svelte components for quickly building app UIs."
	/>
	<meta
		property="og:description"
		content="An extensive collection of copy-and-paste Svelte components for quickly building app UIs."
	/>
	<meta property="og:image:type" content="image/jpeg" /><meta
		property="og:image:width"
		content="2400"
	/>
	<meta property="og:image:height" content="1260" />
	<meta property="og:image" content="/og-image.jpg" />

	<meta name="twitter:title" content="Origin UI - Svelte" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta
		name="twitter:description"
		content="An extensive collection of copy-and-paste Svelte components for quickly building app UIs."
	/>
	<meta name="twitter:image:type" content="image/jpeg" />
	<meta name="twitter:image:width" content="2400" />
	<meta name="twitter:image:height" content="1260" />
	<meta name="twitter:image" content="/twitter-image.jpg" />
</svelte:head>

<Illustration />

<main data-home>
	<div class="max-w-3xl max-sm:text-center">
		<h1
			class="font-heading text-foreground mb-4 font-serif text-4xl/[1.1] tracking-tight text-balance md:text-5xl/[1.1]"
		>
			Beautiful UI components built with Tailwind CSS and
			<span class="text-svelte"> Svelte </span>
		</h1>

		<p class="text-md text-muted-foreground mb-4">
			A collection of copy-and-paste components for quickly build application UIs.
		</p>
		<p
			class="border-border text-accent-foreground w-fit max-w-prose border-t pt-4 text-left text-sm text-balance"
		>
			This project is not affiliated with the original <a
				class="underline"
				href="https://originui.com/"
				rel="noreferrer">Origin UI</a
			>. <br />
			<span class="text-muted-foreground text-xs">
				I appreciate their work and have developed these Svelte 5 components based on their design.
			</span>
		</p>
	</div>
	<div class="relative my-16">
		<div class="grid gap-x-6 gap-y-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{#each Object.entries(data.componentsMeta.directoriesBreakdown) as [directory, { componentCount, stateBreakdown }] (directory)}
				{@const readableName = directory.charAt(0).toUpperCase() + directory.slice(1)}
				{@const isReady = stateBreakdown.ready === componentCount}
				<CategoryCard slug={directory} alt="{readableName} demo">
					{#snippet details()}
						<h2 class="_component-directory">
							<a href="/{directory}" class="text-sm font-medium hover:underline">
								{readableName}
							</a>
						</h2>
						<p class="text-muted-foreground text-[13px]">
							{#if isReady}
								{stateBreakdown.ready} Components
							{:else}
								{stateBreakdown.ready}/{componentCount} Components
							{/if}
						</p>
					{/snippet}
				</CategoryCard>
			{/each}
		</div>
	</div>
</main>
