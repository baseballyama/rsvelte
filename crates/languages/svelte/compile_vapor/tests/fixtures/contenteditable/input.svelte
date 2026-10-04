<script>
  let html = $state('<b>first</b>');
  let text = $state('plain <text>');
  let adopted = $state();
  let htmlElement = $state();
  let textElement = $state();
  function edit() {
    htmlElement.innerHTML = '<em>edited</em>';
    htmlElement.dispatchEvent(new Event('input', {bubbles: true}));
    textElement.textContent = 'edited <text>';
    textElement.dispatchEvent(new Event('input', {bubbles: true}));
  }
</script>
<div class="html" contenteditable="true" bind:innerHTML={html} bind:this={htmlElement}>fallback html</div>
<div class="text" contenteditable="true" bind:textContent={text} bind:this={textElement}>fallback text</div>
<div class="adopted" contenteditable="true" bind:textContent={adopted}><span>initial</span></div>
<button class="edit" onclick={edit}>edit</button>
<button class="replace" onclick={() => { html = '<i>replacement</i>'; text = 'replacement & text'; adopted = ''; }}>replace</button>
<p>{html}:{text}:{adopted}</p>
