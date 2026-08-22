<script>
  let clientWidth = $state(0);
  let clientHeight = $state(0);
  let offsetWidth = $state(0);
  let offsetHeight = $state(0);
  let contentRect = $state(null);
  let contentBoxSize = $state(null);
  let borderBoxSize = $state(null);
  let devicePixelContentBoxSize = $state(null);
  let html = $state("<b>a</b>");
  let text = $state("b");
  let content = $state("c");
</script>

<div
  bind:clientWidth
  bind:clientHeight
  bind:offsetWidth
  bind:offsetHeight
  bind:contentRect
  bind:contentBoxSize
  bind:borderBoxSize
  bind:devicePixelContentBoxSize
>
  {clientWidth}{clientHeight}{offsetWidth}{offsetHeight}
</div>

<div contenteditable="true" bind:innerHTML={html}></div>
<div contenteditable="true" bind:innerText={text}></div>
<div contenteditable="true" bind:textContent={content}></div>

<b>{contentRect ? 1 : 0}{contentBoxSize ? 1 : 0}</b>
<b>{borderBoxSize ? 1 : 0}{devicePixelContentBoxSize ? 1 : 0}</b>
