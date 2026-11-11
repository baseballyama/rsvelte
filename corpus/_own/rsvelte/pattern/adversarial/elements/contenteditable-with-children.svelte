<script>
  let html = $state("<b>a</b>");
  let text = $state("b");
  let n = $state(1);
</script>

<div contenteditable="true" bind:innerHTML={html}></div>
<div contenteditable="plaintext-only" bind:textContent={text}></div>
<div contenteditable="false">static {n}</div>
<div contenteditable={n > 0}>toggled {n}</div>
<div
  contenteditable="true"
  role="textbox"
  tabindex="0"
  aria-label="editor"
></div>
<b>{html.length}{text}</b>
