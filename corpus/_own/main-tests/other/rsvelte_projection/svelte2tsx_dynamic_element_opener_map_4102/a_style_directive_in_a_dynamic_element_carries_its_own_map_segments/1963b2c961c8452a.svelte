<script lang="ts">
	const tag = 'div';
	let flag = false;
	let el: HTMLElement | undefined = undefined;
	let hue = 'red';
	let rest = {};
</script>

<svelte:element this={tag} style:color={hue}>c</svelte:element>
