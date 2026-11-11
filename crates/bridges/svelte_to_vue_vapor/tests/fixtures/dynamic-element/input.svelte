<script>let tag = $state('p'); let count = $state(0);</script>
<button onclick={() => tag = tag === 'p' ? 'b' : 'p'}>switch</button>
<button onclick={() => count++}>increment</button>
<button onclick={() => tag = null}>remove</button>
<svelte:element this={tag} class="dynamic">{count}</svelte:element>
