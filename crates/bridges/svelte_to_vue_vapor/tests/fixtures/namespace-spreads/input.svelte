<script>
  let mode = $state(0);
  let sampled = $state('');
  let attributes = $derived(mode === 0 ? {
    viewBox: '0 0 20 20', preserveAspectRatio: 'xMidYMid meet', camelCase: 'first',
    'xlink:href': '#first', class: ['one', { active: true }], title: 'initial'
  } : mode === 1 ? {
    viewBox: '0 0 40 40', preserveAspectRatio: 'none', camelCase: 'next',
    'xlink:href': '#next', class: { changed: true }, title: 'next'
  } : {});
  function sample() {
    sampled = JSON.stringify(Array.from(document.querySelectorAll('[data-case]'), element => [
      element.namespaceURI, element.getAttribute('viewBox'), element.getAttribute('viewbox'),
      element.getAttribute('preserveAspectRatio'), element.getAttribute('camelCase'),
      element.getAttribute('camelcase'), element.getAttribute('xlink:href'),
      element.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
    ]));
  }
</script>
<button onclick={() => mode = (mode + 1) % 3}>change</button>
<button onclick={sample}>sample</button>
<svg data-case {...attributes}>
  <use data-case {...attributes} />
  <foreignObject><div data-case {...attributes}>html</div></foreignObject>
</svg>
<math><mrow data-case {...attributes}><mi>x</mi></mrow></math>
<output>{sampled}</output>
