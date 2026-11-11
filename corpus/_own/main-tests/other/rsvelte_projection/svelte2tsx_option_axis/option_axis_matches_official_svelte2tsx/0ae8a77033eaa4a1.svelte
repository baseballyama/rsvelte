<script lang="ts">
	export let name: string;
</script>

<slot {name} />
<slot name="footer" />
