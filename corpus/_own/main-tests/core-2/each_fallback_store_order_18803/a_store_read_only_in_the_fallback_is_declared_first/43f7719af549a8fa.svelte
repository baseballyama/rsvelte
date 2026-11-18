<script>import { a, b } from './stores.js'; export let options = [];</script>
{#each options as option}<span>{$a} {option}</span>{:else}<span>{$b}</span>{/each}