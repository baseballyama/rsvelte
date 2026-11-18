<script>
	let 箱;

	function 実行() {
		箱.remove();
	}
</script>

<div bind:this={箱}>中身</div>
<button on:click={実行}>削除</button>
