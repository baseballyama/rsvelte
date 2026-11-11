<script lang="ts">
	function f(): {
		/* c */
		b: number;
	} {
		return { b: 1 };
	}
	let a = f();
</script>
<i>{a.b}</i>
