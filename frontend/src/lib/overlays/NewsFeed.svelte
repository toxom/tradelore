<script>
    import { onMount } from 'svelte';
    
    // Props
    export let defaultKeywords = [];
    export let maxItems = 10;
    export let categories = ['ALL']; // Possible values: 'ALL', 'BUSINESS', 'BLOCKCHAIN', 'MARKET', etc.
    
    // State
    let news = [];
    let isLoading = false;
    let error = null;
    let userKeywords = [...defaultKeywords];
    let newKeyword = '';
    let selectedCategory = categories[0];
    
    // Fetch news from CryptoCompare API
    async function fetchNews() {
      isLoading = true;
      error = null;
      
      try {
        // CryptoCompare News API
        const endpoint = 'https://min-api.cryptocompare.com/data/v2/news/';
        const params = new URLSearchParams({
          lang: 'EN',
          categories: selectedCategory !== 'ALL' ? selectedCategory : '',
          excludeCategories: 'Sponsored',
          lTs: Date.now()
        });
        
        const response = await fetch(`${endpoint}?${params.toString()}`);
        const data = await response.json();
        
        if (data.Response === 'Error') {
          throw new Error(data.Message);
        }
        
        news = data.Data || [];
        
        // Apply filters if keywords exist
        if (userKeywords.length > 0) {
          filterNews();
        }
        
      } catch (err) {
        error = "Failed to fetch news. " + err.message;
        console.error(err);
      } finally {
        isLoading = false;
      }
    }
    
    // Filter news based on keywords
    function filterNews() {
      if (userKeywords.length === 0) return;
      
      news = news.filter(item => {
        const content = (item.title + ' ' + item.body || '').toLowerCase();
        return userKeywords.some(keyword => 
          content.includes(keyword.toLowerCase())
        );
      }).slice(0, maxItems);
    }
    
    // Add a new keyword
    function addKeyword() {
      if (newKeyword.trim() && !userKeywords.includes(newKeyword.trim())) {
        userKeywords = [...userKeywords, newKeyword.trim()];
        newKeyword = '';
        filterNews();
      }
    }
    
    // Remove a keyword
    function removeKeyword(keyword) {
      userKeywords = userKeywords.filter(k => k !== keyword);
      fetchNews(); // Re-fetch to get more results
    }
    
    // Handle category change
    function changeCategory(category) {
      selectedCategory = category;
      fetchNews();
    }
    
    // Format date
    function formatDate(timestamp) {
      return new Date(timestamp * 1000).toLocaleString();
    }
    
    // Track when categories prop changes
    $: {
      categories;
      // Ensure selected category is valid
      if (!categories.includes(selectedCategory)) {
        selectedCategory = categories[0];
      }
    }
    
    // Initialize
    onMount(() => {
      fetchNews();
    });
  </script>
  
  <div class="financial-news-feed">
    <div class="header">
      
      <div class="categories">
        {#each categories as category}
          <button 
            class="toggle-button {selectedCategory === category ? 'active' : ''}"
            on:click={() => changeCategory(category)}
          >
            {category}
          </button>
        {/each}
      </div>
      
      <div class="filters">
        <div class="keywords">
          {#each userKeywords as keyword}
            <span class="keyword">
              {keyword}
              <button on:click={() => removeKeyword(keyword)} class="remove-btn">×</button>
            </span>
          {/each}
        </div>
        
        <div class="keyword-input">
          <input 
            type="text" 
            bind:value={newKeyword} 
            placeholder="Add keyword filter"
            on:keypress={(e) => e.key === 'Enter' && addKeyword()}
          />
          <button class="toggle-button" on:click={addKeyword}>Add</button>
        </div>
        
        <button class="toggle-button" on:click={fetchNews}>
          Refresh
        </button>
      </div>
    </div>
    
    <div class="news-container">
      {#if isLoading}
        <div class="loading">Loading financial news...</div>
      {:else if error}
        <div class="error">{error}</div>
      {:else if news.length === 0}
        <div class="empty">
          No news found. Try removing some filters or refreshing.
        </div>
      {:else}
        <ul class="news-list">
          {#each news as item}
            <li class="news-item">
              <div class="news-meta">
                <img src={item.imageurl} alt="News thumbnail" class="news-image" />
                <div class="news-source">
                  <span class="source-name">{item.source}</span>
                  <span class="date">{formatDate(item.published_on)}</span>
                  {#if item.categories}
                    <div class="tags">
                      {#each item.categories.split('|') as tag}
                        {#if tag}
                          <span class="tag">{tag}</span>
                        {/if}
                      {/each}
                    </div>
                  {/if}
                </div>
              </div>
              
              <div class="news-content">
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  <h3>{item.title}</h3>
                </a>
                <p class="description">{item.body ? item.body.substring(0, 200) + '...' : ''}</p>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
  
  <style lang="scss">

    @use "src/styles/themes.scss" as *;
        * {
            font-family: var(--font-family);

        }    
     .financial-news-feed {
      margin: 0;
      margin-top: 1rem;
      padding: 1rem;
      overflow-y: scroll;
      scrollbar-color: var(--text-color) transparent;
      scrollbar-width: thin;
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    
    .header {
      margin-bottom: 1.5rem;
    }
    
    .header h2 {
      margin: 0 0 1rem 0;
    }
    
    .categories {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
      padding: 0.5rem;
    }
    
    .category-btn {
      padding: 0.4rem 0.8rem;
      background-color: #f1f1f1;
      border: 1px solid #ddd;
      border-radius: 4px;
      color: #333;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    
    .category-btn:hover {
      background-color: #e4e4e4;
    }
    
    .category-btn.active {
      background-color: #0066cc;
      color: white;
      border-color: #0052a3;
    }
    
    .filters {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      background: var(--primary-color);
      padding: 1rem;
      border-radius: 2rem;

    }
    
    .keywords {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    .keyword {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      background-color: #e9f5ff;
      color: #0066cc;
      padding: 0.3rem 0.6rem;
      border-radius: 4px;
      font-size: 0.9rem;
    }
    
    .remove-btn {
      background: none;
      border: none;
      color: #0066cc;
      cursor: pointer;
      font-weight: bold;
      padding: 0;
      font-size: 1rem;
    }
    
    .keyword-input {
      display: flex;
      gap: 0.5rem;
    }
    
    input {
      flex: 1;
      padding: 0.5rem;
      border: none;
      border-radius: 2rem;
      padding-left: 1rem;
      font-size: 1rem;
      background-color: var(--primary-color);
    }
    
    button.toggle-button {
        background: var(--tertiary-color);
    }
    
    
    .news-container {
      margin-top: 1rem;
      width: 100%;
    }
    
    .loading, .error, .empty {
      padding: 2rem;
      text-align: center;
      color: #666;
      background-color: #f9f9f9;
      border-radius: 6px;
    }
    
    .error {
      color: #d32f2f;
    }
    
    .news-list {
      list-style-type: none;
      padding: 0;
      margin: 0;
      width: 100%;
    }
    
    .news-item {
        padding: 1.2rem;
        margin-bottom: 1rem;
        border-radius: 2rem;
        background: var(--bg-gradient-fade);
        transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .news-item:hover {
      transform: translateX(0.5rem);
      box-shadow: -1px -1px 10px 4px rgba(255, 255, 255, 0.2);
    }
    
    .news-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.8rem;
    }
    
    .news-image {
      width: 80px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
    }
    
    .news-source {
      display: flex;
      flex-direction: column;
      font-size: 0.85rem;
    }
    
    .source-name {
      font-weight: 600;
      color: var(--text-color);
    }
    
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
      margin-top: 0.3rem;
    }
    
    .tag {
      background: var(--bg-gradient-fade);
      color: var(--text-color);
      padding: 0.1rem 0.4rem;
      border-radius: 1rem;
      letter-spacing: 0.1rem;
      font-size: 0.75rem;
    }
    
    .news-content h3 {
      margin: 0 0 0.7rem 0;
      color: var(--text-color);
    }
    
    .news-item a {
      text-decoration: none;
      
    }
    
    .news-item a:hover h3 {
      color: #0066cc;
    }
    
    .description {
      margin: 0.5rem 0;
      line-height: 1.5;
      color: var(--text-color);
    }
    
    .date {
      margin: 0.2rem 0;
      color: var(--text-color);
    }
  </style>