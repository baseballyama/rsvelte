<script>
	import { vmodel, vModelSelect, looseEqual } from './runtime.js';

	let model = $state('b');
</script>

<select {@attach vmodel(vModelSelect, () => model, {}, { 'onUpdate:modelValue': (v) => (model = v) })}>
	<option value="a" selected={looseEqual(model, 'a') ? '' : undefined}>A</option>
	<option value="b" selected={looseEqual(model, 'b') ? '' : undefined}>B</option>
	<option disabled={model === 'a' ? '' : undefined}>c</option>
</select>
