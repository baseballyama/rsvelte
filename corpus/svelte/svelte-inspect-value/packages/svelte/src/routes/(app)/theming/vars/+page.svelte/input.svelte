<script lang="ts">
  import { createPageTitle } from '$doclib/util.js'
  import vars from './vars-defaults.js'
</script>

<svelte:head>
  <title>{createPageTitle('CSS Variables')}</title>
</svelte:head>

<h2>CSS Variables</h2>

<table>
  <thead>
    <tr>
      <th>Variable</th>
      <th>Default</th>
    </tr>
  </thead>
  <tbody>
    {#each vars as [v, def], i (i)}
      <tr>
        <td class="varname">{v}</td>
        <td>{def}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  table {
    border: 1px solid var(--docs-border-color);
    border-collapse: collapse;
    font-size: 14px;
    font-family: monospace;
    text-align: left;
  }

  td,
  th {
    border: 1px solid var(--docs-border-color);
    padding: 0.5em;
  }

  .varname {
    width: 400px;
  }
</style>
