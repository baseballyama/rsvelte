<script module>
	export * from './re-exported.js';
	export * as ns from './namespaced.js';
	export * from './with-attributes.js' with { type: 'json' };
	export { named } from './named.js';
</script>

<script>
	export let a = 1;
</script>

{a}
