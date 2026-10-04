<script>let win = $state(); let n = $state(0);</script><svelte:window bind:this={win} onclick={() => n++}/><p>{n}</p>
