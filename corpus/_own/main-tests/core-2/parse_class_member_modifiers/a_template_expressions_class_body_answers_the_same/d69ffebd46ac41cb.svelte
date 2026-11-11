<svelte:options customElement={{
	tag: "custom-element",
	extend: (c) => {
		return class extends c {
			public test: string = "test";
			protected readonly n = 1;
			declare d: number;
			override m() {}
		}
	},
}}/>

<script lang="ts">
	let { name } = $props();
</script>

<p>{name}</p>