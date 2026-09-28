<script lang="ts">
  import { VirtualList, type VLSlotSignature } from 'svelte-virtuallists';
  import { getRandomSushi } from '../sushi';

  const myModel = new Array(10000).fill(1).map((v, i) => {
    return { text: '#' + i + ' ' + getRandomSushi() };
  });
</script>

<div class="gradient myStyle">
  <VirtualList items={myModel} style="height:600px">
    {#snippet vl_slot({ item }: VLSlotSignature<(typeof myModel)[0]>)}
      <div class="slotStyle">
        {item.text}
      </div>
    {/snippet}
  </VirtualList>
</div>

<style>
  .gradient {
    background: rgb(100, 187, 243);
    background: linear-gradient(90deg, rgba(100, 187, 243, 1) 0%, rgba(100, 102, 233, 1) 100%);
  }

  .myStyle {
    border-radius: 1em;
  }

  .slotStyle {
    background: #4f76be;
    color: #fff;
    font-weight: 500;
    opacity: 0.8;
    border-radius: 4px;
    width: 400px;
    height: 2em;
    align-items: center;
    padding: 10 50%;
    margin: 0 auto;
    margin-bottom: 0.5em;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
