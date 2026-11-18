<script context="module">export const answer = 42;</script>
<script lang="ts">let { label = "count" }: { label?: string } = $props();</script>
<h1>{label}</h1>
<style>h1 { color: rebeccapurple }</style>