<script lang="ts">
	let o = $state({ a: 0, b: 0 });
	
	export function go() { o.a = o.b = () => {}; }
</script>
{o.a}
