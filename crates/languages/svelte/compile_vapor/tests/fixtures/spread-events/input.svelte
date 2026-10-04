<script>
  let mode = $state(0);
  let history = $state('');
  function log(value) { history += value; }
  function first() { log('first;'); }
  function second() { log('second;'); }
  let attributes = $derived(mode === 0 ? {onclick: first, title: 'first'} : mode === 1 ? {onclick: second, title: 'second'} : mode === 2 ? {onclick: null} : {});
  let explicit = $derived(mode === 0 ? first : mode === 1 ? second : null);
</script>
<button id="change" onclick={() => mode = (mode + 1) % 4}>change</button>
<button id="spread" {...attributes}>spread</button>
<button id="before" onclick={() => log('before;')} {...attributes}>before</button>
<button id="after" {...attributes} onclick={() => log('after;')}>after</button>
<button id="explicit" {...{title: mode}} onclick={explicit}>explicit</button>
<div onclickcapture={() => log('capture;')} {...{title: mode}} onclick={() => log('bubble;')}><button id="child" {...{onclick: () => log('child;')}}>child</button></div>
<output>{history}</output>
