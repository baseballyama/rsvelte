<script lang="ts">
	let o = { p: 1 };
</script>

<p>{(globalThis as any).p}</p>
<p>{(o satisfies object).p}</p>
<p>{(fn!)()}</p>
