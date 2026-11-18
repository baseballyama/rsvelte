<script lang="ts">const p = Promise.resolve(true);</script>
{#await p then v}{v}{:catch e}{e}{/await}