<script>
  import { crossfade } from 'svelte/transition';
  let left = $state(true);
  let events = $state([]);
  const [send, receive] = crossfade({ duration: 1000 });
</script>
<button onclick={() => left = !left}>move</button>
<output>{events.join(',')}</output>
<div class="left">
  {#if left}<p in:receive={{key:'item'}} out:send={{key:'item'}} onintrostart={() => events.push('left:in:start')} onintroend={() => events.push('left:in:end')} onoutrostart={() => events.push('left:out:start')} onoutroend={() => events.push('left:out:end')}>crossfade</p>{/if}
</div>
<div class="right">
  {#if !left}<p in:receive={{key:'item'}} out:send={{key:'item'}} onintrostart={() => events.push('right:in:start')} onintroend={() => events.push('right:in:end')} onoutrostart={() => events.push('right:out:start')} onoutroend={() => events.push('right:out:end')}>crossfade</p>{/if}
</div>
<style>.left { margin-left: 0px; } .right { margin-left: 100px; } p { width: 60px; }</style>
