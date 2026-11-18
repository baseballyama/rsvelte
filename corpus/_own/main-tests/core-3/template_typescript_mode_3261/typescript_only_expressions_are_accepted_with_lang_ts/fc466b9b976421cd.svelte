<script module lang="ts">
	export const m = 1;
</script>
<p {...{ a: (<T,>(a: T) => a)(1) }}>x</p>
