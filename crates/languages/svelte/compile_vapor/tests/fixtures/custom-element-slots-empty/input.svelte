<svelte:options customElement="vapor-empty-slot" />
<script>let count = $state(0);</script>
<slot name="named"><b>named fallback {count}</b></slot>
<slot><i>default fallback {count}</i></slot>
<button onclick={() => count++}>change</button>
