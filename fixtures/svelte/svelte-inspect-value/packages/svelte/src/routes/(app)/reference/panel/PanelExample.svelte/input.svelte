<script lang="ts">
  import Todo from './Todo.svelte'
</script>

<h3>Demo</h3>

<div id="panel-example">
  <Todo />
</div>

<style>
  #panel-example {
    display: flex;
    position: relative;
    flex-direction: column;
    gap: 1ch;
    border-radius: 8px;
    background-color: rgb(94, 84, 106);
    padding: 2ch;
    width: 100%;
    height: 800px;
    overflow: hidden;
    color: black;
    font-size: 12px;
    font-family: monospace;
  }
</style>
