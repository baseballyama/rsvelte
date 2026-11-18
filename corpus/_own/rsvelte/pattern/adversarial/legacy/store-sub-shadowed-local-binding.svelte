<script>
	import { writable } from 'svelte/store';

	const translator = writable('outer store');

	function translate(key) {
		const $translator = (value) => `${key}:${value}`;
		return $translator('local binding');
	}
</script>

<p>{$translator}</p>
<p>{translate('key')}</p>
