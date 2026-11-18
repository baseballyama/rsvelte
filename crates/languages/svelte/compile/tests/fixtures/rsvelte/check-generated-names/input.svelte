<script lang="ts">
	import type { Component } from 'svelte';
	const Foo: Component<{ a: number }> = null!;
</script>

<Foo
	a={1}>x</Foo>
<div this-is="wrong"></div>
