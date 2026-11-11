<script lang="ts">
	type Props = { 一覧: number[] };
	let { 一覧 }: Props = $props();
</script>

<div data-x="𝔘𝔫𝔦👨‍👩‍👧‍👦">
	{#each 一覧 as 要素 (要素)}
		👩‍🚀{@const 倍 = 要素 * 2}<span>{倍}</span>
	{/each}
</div>
