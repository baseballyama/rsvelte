<script lang="ts">
	import { REPO_URL } from '#lib/site.ts';

	let { rev }: { rev: string } = $props();
</script>

<footer class="mt-24 border-t border-line">
	<div
		class="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-8 text-[13px] text-muted md:px-8"
	>
		<p class="font-mono tracking-normal text-fg-2">rsvelte</p>
		<p>利用・改変・再配布を認めるライセンス</p>
		<ul class="contents">
			<li><a class="hover:text-fg" href="/guide">使い方ガイド</a></li>
			<li><a class="hover:text-fg" href="/why">rsvelte を作る理由</a></li>
			<li><a class="hover:text-fg" href="/learn">開発者向けの教材</a></li>
			<li><a class="hover:text-fg" href="/learn/reference">リファレンス</a></li>
			<li><a class="hover:text-fg" href={REPO_URL} rel="noopener">GitHub</a></li>
			<li class="md:ml-auto">
				<a
					class="font-mono tracking-normal hover:text-fg"
					href="{REPO_URL}/commit/{rev}"
					rel="noopener"
					title="このサイトをビルドしたコミット">build {rev.slice(0, 10)}</a
				>
			</li>
		</ul>
	</div>
</footer>
