<script>
	let n = $state(1);
</script>

<template id="row-tpl">
	<tr>
		<td>{n}</td>
	</tr>
</template>

<noscript>
	<p>enable js {n}</p>
</noscript>

<slot name="fallback">
	<template shadowrootmode="open">
		<span>shadow {n}</span>
	</template>
</slot>
