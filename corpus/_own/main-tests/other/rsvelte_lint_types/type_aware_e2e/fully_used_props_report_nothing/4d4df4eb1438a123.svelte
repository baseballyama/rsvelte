<script lang="ts">
	interface Base { a: string }
	interface Props extends Base { b: number }
	let { a, b }: Props = $props();
	console.log(a, b);
</script>
