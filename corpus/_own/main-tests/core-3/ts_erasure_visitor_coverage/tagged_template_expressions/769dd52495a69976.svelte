<script lang="ts">
	const x = 1;
	function tag(s: TemplateStringsArray) { return s.raw.join(''); }
	const r = tag`${x as string}`;
	console.log(r);
</script>

<p>ok</p>
