<div class="a">
  <div class="b">
    <div class="c">
      <div class="d">
        <div class="e">
          <div class="f">
            <div class="g">
              {#each list as category}
                <button
                  on:click={(event) => selectCategory(event, category.id, category.name)}
                >x</button>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
