<script lang="ts">
	import Guide from '$lib/components/Guide.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.guide.title} · rsvelte docs</title>
	<meta name="description" content={data.guide.tagline} />
</svelte:head>

<Guide guide={data.guide} />
