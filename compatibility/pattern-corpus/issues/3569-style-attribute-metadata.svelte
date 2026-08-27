<script>
	let color = $state('red');

	function local(value) {
		return value;
	}
</script>

<div style={local(`color:${color}`)}></div>
<div style="display:{local('block')};color:{color}"></div>
<div style={String('display:block')}></div>
<svelte:element this="div" style="color:{local(color)}"></svelte:element>
