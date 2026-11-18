{#each cols as column}
  <td use:tableCell={{ column, rowData, rowIndex, tableData: dataValues }}>
    {value}
  </td>{/each}
