<script>
	let n = $state(0);
	function f(a) {
		return 'v';
	}
</script>

<!-- the defect: the memoized value is `$0`, and the effect has to bind it -->
<svelte:element this={'span'} class:x={f()}></svelte:element>
<svelte:element this={'span'} class:x={f()} class:y={f()}></svelte:element>
<svelte:element this={'span'} class="base" class:x={f()}></svelte:element>

<!-- the memoizer is the element's own: an enclosing memo is `$0` there and the
     inner one restarts at `$0`, so a shared memoizer renumbers the inner slot -->
<div title={f(1)}>
	<svelte:element this={'span'} class:x={f(2)}></svelte:element>
</div>
<svelte:element this={'i'} class:a={f(1)}>
	<svelte:element this={'b'} class:x={f(2)}></svelte:element>
</svelte:element>
{#each [1] as i}
	<svelte:element this={'span'} class:x={f(i)}></svelte:element>
{/each}

<!-- nothing memoized: no parameter list may be manufactured -->
<svelte:element this={'span'} class:x={n}></svelte:element>

<!-- already correct, and the controls that name the class-directive path:
     `style:` and a plain attribute reach `$.attribute_effect`, which builds its
     own parameter list, and a regular element drains its own memoizer -->
<svelte:element this={'span'} style:color={f()}></svelte:element>
<svelte:element this={'span'} title={f()}></svelte:element>
<div class:x={f()}></div>
