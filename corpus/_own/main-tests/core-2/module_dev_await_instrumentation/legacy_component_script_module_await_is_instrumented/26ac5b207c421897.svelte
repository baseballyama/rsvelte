<script module>
	export async function load() {
		return await fetch("/x");
	}
</script>

<script>
	export let a = 1;
</script>

<p>{a}</p>