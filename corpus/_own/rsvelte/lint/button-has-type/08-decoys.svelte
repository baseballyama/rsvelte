<script>
  // <button> in a comment should not matter
  const html = '<button type="wrong">in string</button>';
  let tag = 'button';
</script>

<!-- <button type="nope"> in an html comment -->
{@html html}
<svelte:element this={tag}>dynamic button is not matched</svelte:element>
<p>the word button and type="bad" in text</p>
<div type="foo">type on a div is fine</div>
