<script lang="ts">
	import SelectionMenu from '$libs/components/selection-menu.svelte';
</script>

<SelectionMenu
	search={{
		onChange: (value) => {
			console.log(value.toUpperCase());
		}
	}}
/>
