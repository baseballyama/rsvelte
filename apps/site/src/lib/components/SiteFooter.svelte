<script lang="ts">
	import { REPO_URL } from '$lib/site';

	let { rev }: { rev: string } = $props();
</script>

<footer class="mt-24 border-t border-line">
	<div
		class="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-8 text-[13px] text-muted md:px-8"
	>
		<span class="font-mono tracking-normal text-fg-2">rsvelte</span>
		<span>利用・改変・再配布を認めるライセンス</span>
		<a class="hover:text-fg" href="/why">なぜrsvelteか</a>
		<a class="hover:text-fg" href="/learn">Learn</a>
		<a class="hover:text-fg" href="/learn/reference">リファレンス</a>
		<a class="hover:text-fg" href={REPO_URL} rel="noopener">GitHub</a>
		<a
			class="font-mono tracking-normal hover:text-fg md:ml-auto"
			href="{REPO_URL}/commit/{rev}"
			rel="noopener"
			title="このサイトをビルドしたコミット">build {rev.slice(0, 10)}</a
		>
	</div>
</footer>
