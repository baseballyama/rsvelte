<script>
	/* eslint svelte/no-unnecessary-state-wrap: ["warn", { "additionalReactiveClasses": ["ReactiveModel"] }] */
	class ReactiveModel {}
	let m = $state(new ReactiveModel());
	let other = $state(new Map());
</script>

{m}{other.size}
