<script>
  let rows = $state([{ id: 1, cells: ["a", "b"] }]);
</script>

<table>
  <caption>c</caption>
  <colgroup>
    <col span="2" />
  </colgroup>
  <thead>
    <tr>
      {#each rows[0].cells as cell}
        <th scope="col">{cell}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each rows as row (row.id)}
      <tr>
        {#each row.cells as cell}
          <td>{cell}</td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<ol start="2" reversed>
  {#each rows as row}
    <li value={row.id}>{row.id}</li>
  {/each}
</ol>

<dl>
  {#each rows as row}
    <dt>{row.id}</dt>
    <dd>{row.cells[0]}</dd>
  {/each}
</dl>
