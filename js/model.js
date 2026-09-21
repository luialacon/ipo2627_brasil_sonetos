export class SonnetModel {
    constructor() {
        this.sonnetsList = [];
        this.currentSonnet = null;
    }

    async init() {
        try {
            const response = await fetch('./data/index.json');
            this.sonnetsList = await response.json();

            // Carga diferida de los nombres de los autores
            this.sonnetsList.forEach(async (item) => {
                try {
                    const res = await fetch(item.file);
                    const text = await res.text();
                    const authorMatch = text.match(/^Autor:\s*"?([^"\r\n]+)"?/m);
                    item.author = authorMatch ? authorMatch[1].trim() : 'Anónimo';
                } catch (e) {
                    item.author = 'Anónimo';
                }
            });

            if (this.sonnetsList.length > 0) {
                await this.loadSonnetById(this.sonnetsList[0].id);
            }
        } catch (error) {
            console.error("Error al cargar la lista de sonetos:", error);
        }
    }

    getSonnetsList() {
        return this.sonnetsList;
    }

    getCurrentSonnet() {
        return this.currentSonnet;
    }

    searchSonnets(query) {
        if (!query || query.trim() === '') return [];
        const cleanQuery = query.toLowerCase().trim();
        
        return this.sonnetsList.filter(s => 
            s.title.toLowerCase().includes(cleanQuery) || 
            (s.author && s.author.toLowerCase().includes(cleanQuery))
        );
    }

    async loadSonnetById(id) {
        const item = this.sonnetsList.find(s => s.id === id);
        if (!item) return null;

        const response = await fetch(item.file);
        const markdownText = await response.text();

        this.currentSonnet = this._parseMarkdownSonnet(id, markdownText);
        return this.currentSonnet;
    }

    _parseMarkdownSonnet(id, text) {
        const lines = text.replace(/\r\n/g, '\n').split('\n');

        let title = "Sin título";
        let author = "Anónimo";
        const verses = [];

        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (/^T[íi]tulo:/i.test(trimmed)) {
                title = trimmed.replace(/^T[íi]tulo:\s*/i, '').replace(/^"|"$/g, '').trim();
            } else if (/^Autor:/i.test(trimmed)) {
                author = trimmed.replace(/^Autor:\s*/i, '').replace(/^"|"$/g, '').trim();
            } else if (/^Soneto:?$/i.test(trimmed)) {
                continue;
            } else {
                verses.push(trimmed);
            }
        }

        const stanzas = [];
        if (verses.length >= 14) {
            stanzas.push(verses.slice(0, 4));
            stanzas.push(verses.slice(4, 8));
            stanzas.push(verses.slice(8, 11));
            stanzas.push(verses.slice(11, 14));
        } else {
            stanzas.push(verses);
        }

        return { id, title, author, stanzas };
    }
}