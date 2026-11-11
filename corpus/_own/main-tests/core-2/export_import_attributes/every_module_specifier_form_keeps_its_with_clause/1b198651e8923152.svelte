<script module>
	export * from './re-exported.js';
	export * from './star-attributes.js' with { type: 'json' };
	export { named } from './named.js' with { type: 'json' };
	import './side-effect.js' with { type: 'json' };
	import data from './default.js' with { type: 'json' };
</script>
<p>x</p>