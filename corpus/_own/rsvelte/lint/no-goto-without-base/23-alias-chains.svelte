<script>
	import { goto } from '$app/navigation';
	import * as nav from '$app/navigation';
	const one = goto;
	const two = one;
	const wrapped = { g: goto };
	const nsCopy = nav;
	function later() {
		two('/two-hops');
		nsCopy.goto('/namespace-copy');
		wrapped.g('/object-property');
	}
	void [two, wrapped, nsCopy, later];
</script>
<p>alias chains</p>
