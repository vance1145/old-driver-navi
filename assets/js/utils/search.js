const Search = {
  currentQuery: '',

  search(query) {
    this.currentQuery = query.trim().toLowerCase();
    if (!this.currentQuery) return null;

    const results = [];
    for (const category of NAV_DATA.categories) {
      const matchingLinks = category.links.filter(link =>
        link.title.toLowerCase().includes(this.currentQuery) ||
        (link.desc && link.desc.toLowerCase().includes(this.currentQuery)) ||
        category.name.toLowerCase().includes(this.currentQuery)
      );
      if (matchingLinks.length > 0) {
        results.push({
          ...category,
          links: matchingLinks
        });
      }
    }
    return results;
  },

  clear() {
    this.currentQuery = '';
  }
};
