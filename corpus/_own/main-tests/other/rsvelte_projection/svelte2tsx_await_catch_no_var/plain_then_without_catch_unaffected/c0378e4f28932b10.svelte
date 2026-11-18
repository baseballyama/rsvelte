<script lang="ts">const p = Promise.resolve(true);</script>
{#await p}wait{:then v}{v}{/await}