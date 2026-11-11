<script>import { writable } from 'svelte/store';
const y = writable(1);</script>
<input bind:value={$y} />