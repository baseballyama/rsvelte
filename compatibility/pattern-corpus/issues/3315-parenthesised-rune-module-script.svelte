<script module>
	export let shared = ($state(1));

	export class M {
		f = ($state(2));
		g = ($derived(this.f + 1));
	}
</script>

<script>
	let base = $state(3);
</script>

<p>{base}{shared}</p>
