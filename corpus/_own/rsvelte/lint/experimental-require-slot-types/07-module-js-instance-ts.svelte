<script context="module">
	export const shared = 1;
</script>

<script lang="ts">
	export let title: string;
</script>
<h1>{title}</h1>
<slot />
