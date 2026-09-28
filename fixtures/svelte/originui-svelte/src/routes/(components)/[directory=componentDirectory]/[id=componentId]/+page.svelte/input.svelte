<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import ComponentHead from '$lib/demo/component-head.svelte';
	import Content from '$lib/demo/component-preview/content.svelte';

	import { onNavigate } from '$app/navigation';

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<ComponentHead component={data.component} />
<Content isSinglePage component={data.component} />
