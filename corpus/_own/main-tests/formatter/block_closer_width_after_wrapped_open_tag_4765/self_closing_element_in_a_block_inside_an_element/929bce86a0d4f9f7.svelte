<ul>{#each items as item}<Second
  onclick={() => handle(item.id, item.name)} disabled={!enabled}
/>{/each}</ul>
