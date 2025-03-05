<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { fade } from 'svelte/transition';
  
    export let options: Array<{ code: string; name: string; label?: string | undefined; currentTime?: string }>;    export let selectedValue: string;
    export let icon: any = null;

    let isOpen = false;
    const dispatch = createEventDispatcher();
  
    function handleSelect(value: string) {
      selectedValue = value;
      isOpen = false;
      dispatch('select', value);
    }
  
    $: selectedLabel = options.find(opt => opt.code === selectedValue)?.label || options.find(opt => opt.code === selectedValue)?.currentTime || selectedValue;
    $: selectedName = options.find(opt => opt.code === selectedValue)?.name || selectedValue;

  </script>
  
  <div class="dropdown">
    <span>

    <button class="dropdown-btn" on:click={() => isOpen = !isOpen} class:active={isOpen}>
        {#if icon}
          <svelte:component this={icon} size={16}/>
        {/if}

          <h3>{selectedLabel}</h3>
          
          {selectedName}
        ▼
      </button>
    </span>

      {#if isOpen}
        <div class="dropdown-content" transition:fade>
          {#each options as {code, name, label}}
            <button 
              class="dropdown-item" 
              class:active={code === selectedValue}
              on:click={() => handleSelect(code)}
            >
              {label}
              {name}
            </button>
          {/each}
        </div>
      {/if}
     </div>
  
     <style lang="scss">
      @use "src/styles/themes.scss" as *;
      
      * {
          font-family: var(--font-family);
      }     
          
      .dropdown {
        position: relative;
    }
    .dropdown-btn {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      // padding: 0.5rem;
      font-size: 1rem;
      border: 1px solid;
      border-color: var(--secondary-color);
      border-radius: 1rem;
      background: var(--primary-color);
      cursor: pointer;
      width: auto;
        color: var(--text-color);
      &.active {
        background: var(--secondary-color);
      }

    span {
      display: flex;
      flex-direction: column;
    }
    }
    .dropdown-content {
      position: absolute;
      top: 110%;
      right: 0;
      display: flex;
      flex-direction: column;
      width: auto;
      justify-content: center;
      align-items: center;
      /* min-width: 120px; */
      background: var(--secondary-color);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 100;
      width: auto;
      border-radius: 1rem;
      padding: 0.5rem;
      gap: 0.5rem;
      
    }

    h3 {
      margin: 0;
      padding: 0;
      font-size: auto;
      width: min-content;

    }

    .dropdown-item {
        width: 100%;
      border: none;
      background: #e1e1e1;
      margin-left: 0;
      cursor: pointer;
      text-align: left;
      display: flex;
      align-items: left;
      flex-direction: row;
      gap: 2rem;
      border-radius: 1rem;
      transition: all 0.3s ease;

    }
    .dropdown-item:hover {
      background: var(--text-color);
      color: var(--primary-color);
    }
    .dropdown-item.active {
      border-radius: 2rem;
      background: var(--primary-color);
      color: var(--text-color);
      font-weight: 700;

    }
  </style>