<script lang="ts">
	let count = 0;
	let obj: any = {};
	function f() { ({ p: count! } = { p: 1 }); }
</script>