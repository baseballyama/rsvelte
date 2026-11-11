<script>
	export let msg;
</script>

{#if msg === 'こんにちは'}
	<p>あ</p>
{:else if msg === 'こんにちは'}
	<p>い</p>
{:else if msg === '😀 x'}
	<p>う</p>
{:else if msg === '😀 x'}
	<p>え</p>
{/if}
