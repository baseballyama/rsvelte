<script>let x = $state(0), y = $state(0);</script>
<button onclick={() => { switch (x) { case 1: y = 1; break; default: y = 2; } }}>b</button>