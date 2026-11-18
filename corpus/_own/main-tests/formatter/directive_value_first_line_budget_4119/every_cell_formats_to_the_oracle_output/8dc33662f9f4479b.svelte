<div class="a">
  <div class="b">
    <div class="c">
      <div class="d">
        <div class="e">
          <div class="f">
            <div class="g">
              {#each list as category}
                <button
                  class:active={category.id === selected.id}
                >x</button>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
