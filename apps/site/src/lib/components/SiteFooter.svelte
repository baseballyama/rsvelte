<script lang="ts">
	import { REPO_URL } from '$lib/site';

	let { rev }: { rev: string } = $props();
</script>

<footer class="mt-24 border-t border-line">
	<div
		class="mx-auto flex max-w-[1400px] flex-wrap items-baseline gap-x-8 gap-y-2 px-4 py-8 text-[13px] text-muted md:px-8 xl:px-12"
	>
		<span class="font-mono tracking-normal text-fg-2">rsvelte</span>
		<span>MIT License</span>
		<a class="link" href={REPO_URL} rel="noopener">GitHub</a>
		<a class="link" href="/learn">Learn</a>
		<span class="font-mono tracking-normal md:ml-auto">build {rev.slice(0, 10)}</span>
	</div>
</footer>
