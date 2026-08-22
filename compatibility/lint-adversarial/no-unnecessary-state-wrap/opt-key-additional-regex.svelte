<script>
	/* eslint svelte/no-unnecessary-state-wrap: ["warn",{"additionalReactiveClasses":["/^Reactive/u"]}] */
	class ReactiveThing {}
	let a = $state(new ReactiveThing());
	let b = $state(new SvelteMap());
	void b;
</script>

<div>{a}</div>
