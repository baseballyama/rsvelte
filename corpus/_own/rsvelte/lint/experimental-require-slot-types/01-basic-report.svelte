<script lang="ts">
	export let title: string;
</script>
<h1>{title}</h1>
<slot />
<slot name="footer" />
