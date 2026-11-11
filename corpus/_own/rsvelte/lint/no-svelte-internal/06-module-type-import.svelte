<script module lang="ts">
	// @ts-expect-error: the package has no types for svelte/internal
	import type { Component } from 'svelte/internal';
	export type Re = Component;
</script>

<script lang="ts">
	import { mount } from 'svelte';
	void mount;
</script>
<p>type import</p>
