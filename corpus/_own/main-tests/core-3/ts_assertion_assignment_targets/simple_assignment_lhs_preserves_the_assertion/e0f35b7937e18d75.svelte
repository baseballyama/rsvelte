<script lang="ts">
	let count = 0;
	let obj: any = {};
	function f() { (count satisfies number) = 1; }
</script>