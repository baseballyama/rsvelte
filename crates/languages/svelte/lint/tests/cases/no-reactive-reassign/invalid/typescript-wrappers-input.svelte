<script lang="ts">
	let a = 0;
	$: v = a;
	$: obj = { a };
	function f() {
		(v as any) = 2;
		obj!.a = 3;
	}
</script>
