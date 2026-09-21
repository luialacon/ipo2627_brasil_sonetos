export class SonnetView {
    constructor() {
        this.selectElement = document.getElementById('sonnet-select');
        this.displayElement = document.getElementById('sonnet-display');
        this.searchInput = document.getElementById('sonnet-search');
        this.searchResultsList = document.getElementById('search-results');
    }

    populateSelectOptions(sonnetsList, currentId) {
        this.selectElement.innerHTML = '';
        sonnetsList.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.title;
            if (item.id === currentId) {
                option.selected = true;
            }
            this.selectElement.appendChild(option);
        });
    }

    updateSelectValue(id) {
        this.selectElement.value = id;
    }

    bindSelectChange(handler) {
        this.selectElement.addEventListener('change', (event) => {
            handler(event.target.value);
        });
    }

    bindSearchInput(handler) {
        this.searchInput.addEventListener('input', (e) => {
            handler(e.target.value);
        });

        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.searchResultsList.contains(e.target)) {
                this.hideSearchResults();
            }
        });
    }

    bindSearchResultSelect(handler) {
        this.searchResultsList.addEventListener('click', (e) => {
            const item = e.target.closest('.search-result-item');
            if (item && item.dataset.id) {
                handler(item.dataset.id);
                this.hideSearchResults();
                this.searchInput.value = '';
            }
        });
    }

    renderSearchResults(results) {
        this.searchResultsList.innerHTML = '';

        if (results.length === 0) {
            const noRes = document.createElement('li');
            noRes.className = 'no-results';
            noRes.textContent = 'No se encontraron coincidencias';
            this.searchResultsList.appendChild(noRes);
        } else {
            results.forEach(res => {
                const li = document.createElement('li');
                li.className = 'search-result-item';
                li.dataset.id = res.id;
                li.innerHTML = `
                    <span class="result-title">${res.title}</span>
                    <span class="result-author">${res.author || ''}</span>
                `;
                this.searchResultsList.appendChild(li);
            });
        }

        this.searchResultsList.classList.remove('hidden');
    }

    hideSearchResults() {
        this.searchResultsList.classList.add('hidden');
    }

    renderSonnet(sonnet) {
        this.displayElement.classList.add('fade-out');

        setTimeout(() => {
            this.displayElement.innerHTML = '';

            const header = document.createElement('header');
            header.className = 'sonnet-header';

            const title = document.createElement('h2');
            title.className = 'sonnet-title';
            title.textContent = sonnet.title;

            const author = document.createElement('p');
            author.className = 'sonnet-author';
            author.textContent = `Por ${sonnet.author}`;

            header.appendChild(title);
            header.appendChild(author);

            const body = document.createElement('div');
            body.className = 'sonnet-body';

            sonnet.stanzas.forEach(stanzaVerses => {
                const stanzaSection = document.createElement('section');
                stanzaSection.className = 'stanza';

                stanzaVerses.forEach(verseText => {
                    const verseSpan = document.createElement('span');
                    verseSpan.className = 'verse';
                    verseSpan.textContent = verseText;
                    stanzaSection.appendChild(verseSpan);
                });

                body.appendChild(stanzaSection);
            });

            this.displayElement.appendChild(header);
            this.displayElement.appendChild(body);

            this.displayElement.classList.remove('fade-out');
        }, 200);
    }
}