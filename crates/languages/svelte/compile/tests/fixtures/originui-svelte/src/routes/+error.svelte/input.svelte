<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status}: {page.error?.message}</title>
</svelte:head>

<div class="flex h-[calc(100vh-16rem)] flex-col items-center justify-center gap-4">
	<h3 class="text-svelte scroll-m-20 text-2xl font-semibold tracking-tight">{page.status}</h3>
	<h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
		{page.error?.message}
	</h1>
</div>
