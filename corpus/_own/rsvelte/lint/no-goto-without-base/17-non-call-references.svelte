<script>
	import { goto } from '$app/navigation';
	const alias = goto;
	const list = [goto];
	function later() {
		alias('/via-copy');
		list[0]('/via-array');
	}
	void [alias, list, later];
</script>
<p>references that are not direct calls</p>
