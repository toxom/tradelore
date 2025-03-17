<script lang="ts">
	import { Languages } from 'lucide-svelte';
    import { createEventDispatcher } from 'svelte';
    import { fade } from 'svelte/transition';
    import type { ComponentType } from 'svelte'; 

    export let options: Array<{ code: string; name: string; label?: string | undefined; currentTime?: string }>;    export let selectedValue: string;
    export let icon: ComponentType | null = null;

    let isOpen = false;
    const dispatch = createEventDispatcher();
  
    function handleSelect(value: string) {
      selectedValue = value;
      isOpen = false;
      dispatch('select', value);
    }
  
    $: selectedLabel = options.find(opt => opt.code === selectedValue)?.label || options.find(opt => opt.code === selectedValue)?.currentTime || selectedValue;
    $: selectedName = options.find(opt => opt.code === selectedValue)?.name || selectedValue;
    $: selectedIcon = options.find(opt => opt.code === selectedValue)?.icon || icon; 

  </script>
  
  <div class="dropdown">
    <span>

    <button class="dropdown-btn" on:click={() => isOpen = !isOpen} class:active={isOpen}>
      {#if selectedIcon}
          <svelte:component this={selectedIcon} size={16} />
      {/if}
          {selectedLabel}
          

          <span class="text">
            {selectedName}
          </span>
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
              <span class="text">
                {name}

              </span>
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
        display: flex;
        flex: 1;
        width: auto;
        position: relative;
    }
    .dropdown-btn {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-around;
      background-color: var(--primary-color);
      gap: 1rem;
      padding: 0.5rem;
      font-size: 1rem;
      flex: 1;
      border: 1px solid;
      border-color: var(--secondary-color);
      border-radius: 1rem;
      cursor: pointer;
      min-width: 100px;
      width:auto;
      transition: all 0.3s ease;

        color: var(--text-color);
      &.active {
        background: var(--tertiary-color);
      }
      h3 {
        color: var(--text-color);
        width: auto;
      }

    span {
      display: flex;
      flex-direction: column;
    }
    span.text {
      display: none;
      &:hover {
        display: inline;
      }
    }
    }
    .dropdown-content {
      position: absolute;
      top: 110%;
      right: 0;
      left: 0;
      display: flex;
      flex-direction: column;
      width: auto;
      justify-content: flex-start;
      align-items: center;
      /* min-width: 120px; */
      background: var(--secondary-color);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 100;
      width: auto;
      border-radius: 1rem;
      padding: 0.5rem;
      gap: 0.5rem;
      overflow-y: scroll;
      max-height: 50vh;
      min-width: 300px;
      
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
      margin-left: 0;
      cursor: pointer;
      text-align: left;
      background-color: var(--bg-color);
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