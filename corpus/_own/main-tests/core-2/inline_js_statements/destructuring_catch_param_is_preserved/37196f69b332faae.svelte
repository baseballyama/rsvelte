<script>let f = () => {};</script>
<button onclick={() => { try { f(); } catch ({ message }) { console.log(message); } }}>x</button>