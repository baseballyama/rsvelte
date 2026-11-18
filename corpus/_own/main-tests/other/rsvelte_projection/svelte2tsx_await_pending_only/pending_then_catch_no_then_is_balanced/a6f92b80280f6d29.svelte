<script lang="ts">const p = Promise.resolve(true);</script>
{#await p}wait{:catch e}{e}{/await}