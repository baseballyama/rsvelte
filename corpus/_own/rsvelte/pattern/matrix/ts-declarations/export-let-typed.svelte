<script lang="ts">
	export let label: string;
	export let count: number = 0;
	export let optional: string | undefined = undefined;
</script>

<p>{label}{count}{optional}</p>
