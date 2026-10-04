<script>
  let size = $state(12);
  let active = $state(true);
  let tag = $state('g');
  let circle = $state();
  let html = $state();
  let dynamic = $state();
  let math = $state();
  let raw = $state('<rect class="raw" width="3" />');
  let observed = $state('');
  function inspect() {
    observed = [circle.namespaceURI, html.namespaceURI, dynamic.namespaceURI, math.namespaceURI, circle.classList.contains('active'), circle.getAttribute('r')].join(':');
  }
</script>
<svg viewBox={`0 0 ${size} ${size}`}>
  <title>diagram {size}</title>
  <defs><clipPath id="clip"><rect width="5" height="5" /></clipPath></defs>
  <circle bind:this={circle} cx="5" cy="5" r={size} class="circle" class:active fill={active ? 'red' : 'blue'} />
  <foreignObject><div bind:this={html}>html {size}</div></foreignObject>
  <svelte:element this={tag} bind:this={dynamic} data-size={size} />
  {#if active}<g><path d="M0 0L1 1" /></g>{/if}
  {@html raw}
  <use xlink:href={active ? '#clip' : null} />
  <use xlink:href={null} />
</svg>
<math><mrow bind:this={math}><mi>x</mi><mo>+</mo><mn>{size}</mn></mrow></math>
<button class="inspect" onclick={inspect}>inspect</button>
<button class="change" onclick={() => { size++; active = !active; tag = tag === 'g' ? 'path' : 'g'; raw = '<ellipse class="raw" rx="4" />'; }}>change</button>
<p>{observed}</p>
