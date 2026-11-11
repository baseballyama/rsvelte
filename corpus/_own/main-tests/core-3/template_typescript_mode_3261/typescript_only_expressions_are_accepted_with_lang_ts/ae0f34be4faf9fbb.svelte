<script module lang="ts">
	export const m = 1;
</script>
<button onclick={() => sink((<T,>(a: T) => a)(1))}>x</button>
