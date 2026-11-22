<script lang="ts">
	declare function foo(...a: unknown[]): void;
	foo(/abc); let { n }: { n: number } = $props();
	export function api() {}
</script>
