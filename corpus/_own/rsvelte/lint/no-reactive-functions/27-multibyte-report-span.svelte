<script>
	export let 個数;
	let 関数;
	/* 絵文字🎉🚀 */ $: 関数 = () => 個数 * 2;
</script>

{関数()}
