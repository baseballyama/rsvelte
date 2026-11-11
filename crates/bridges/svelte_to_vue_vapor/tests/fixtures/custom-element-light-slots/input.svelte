<svelte:options customElement={{ tag: 'vapor-light-slots', shadow: 'none' }} />
<script>let count = $state(0);</script>
<slot name="named"><b>named fallback {count}</b></slot>
<slot><i>default fallback {count}</i></slot>
<button onclick={() => count++}>change</button>
