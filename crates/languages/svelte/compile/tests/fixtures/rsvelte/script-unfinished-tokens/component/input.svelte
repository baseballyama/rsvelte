<script lang="ts">
	const el = <b>x</b>;
	const s = 'abc;
	const r = /abc;
	#;
	let { n }: { n: number } = $props();
	export function api(): number {
		return n;
	}
</script>

<p>{n}</p>
