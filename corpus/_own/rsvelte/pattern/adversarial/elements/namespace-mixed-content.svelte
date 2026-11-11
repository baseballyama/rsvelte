<script>
	let n = $state(1);
</script>

<svg width="20" height="20">
	<defs>
		<linearGradient id="g"><stop offset="0%" /></linearGradient>
	</defs>
	<use href="#g" />
	<text>{n}</text>
	<foreignObject x="0" y="0" width="10" height="10">
		<p>{n} in html</p>
		<svg><rect width="1" height="1" /></svg>
	</foreignObject>
</svg>

<math>
	<mrow><mi>x</mi><mo>+</mo><mn>{n}</mn></mrow>
</math>

<template>
	<p>inert template content {n}</p>
</template>

<table>
	<tbody>
		{#each [n] as row}
			<tr><td>{row}</td></tr>
		{/each}
	</tbody>
</table>
