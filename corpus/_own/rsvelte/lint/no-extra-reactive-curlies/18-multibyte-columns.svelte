<script>
	export let 個数;
	let 合計;
	/* 絵文字🎉🚀のあと */ $: { 合計 = 個数 * 2; }
</script>

{合計}
