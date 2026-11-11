<script>
	import { goto } from './helpers.js';
	import { goto as formGoto } from '$app/forms';
	function local(goto) {
		goto('/parameter-goto');
	}
	function f() {
		goto('/not-from-app-navigation');
		formGoto('/wrong-module');
	}
	void [local, f];
</script>
<p>goto from a module the rule does not track</p>
