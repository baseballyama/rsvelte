<script>let x = $state(0); let y = $state(0);</script>
<C bind:a={() => x, (v) => x = v} bind:b={() => y, (v) => y = v} />