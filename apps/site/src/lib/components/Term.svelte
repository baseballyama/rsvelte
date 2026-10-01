<script lang="ts">
	import { term } from '$lib/terms';
	let { name }: { name: string } = $props();
</script>

<span title="コード上の名前: {name}">{term(name)}</span>
