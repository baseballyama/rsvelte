<script>
	export let count;
	let total;
	$: /* コメント絵文字🎉 */ { total = count * 2; }
</script>

{total}
