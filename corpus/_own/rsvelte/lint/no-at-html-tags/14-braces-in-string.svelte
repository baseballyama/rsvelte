<script>
	let x = 'v';
</script>

{@html '}' + x + '{'}
{@html `a}${x}{b`}
{@html x.replace(/[}{]/gu, '')}
