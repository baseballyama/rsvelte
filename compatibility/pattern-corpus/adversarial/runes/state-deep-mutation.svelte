<script>
  let tree = $state({
    list: [{ id: 1, tags: ["a"] }],
    table: { nested: { count: 0 } },
  });
  let bare = $state([1, 2, 3]);

  function mutate() {
    tree.table.nested.count += 1;
    tree.list[0].tags.push("b");
    tree.list[0].tags[0] = "z";
    tree.list.push({ id: tree.list.length + 1, tags: [] });
    tree.list = tree.list.filter((row) => row.id > 0);
    delete tree.table.nested.missing;
    Object.assign(tree.table, { extra: 1 });

    bare.sort();
    bare.reverse();
    bare.splice(0, 1);
    bare.unshift(0);
    bare.length = 2;
    bare[5] = 9;

    return tree.list.length + bare.length;
  }
</script>

<b>{tree.table.nested.count}</b>
<b>{tree.list.map((row) => row.tags.join("")).join("|")}</b>
<b>{bare.join(",")}</b>
<button onclick={mutate}>go</button>
