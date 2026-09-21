export class SonnetController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    async init() {
        await this.model.init();

        const sonnetsList = this.model.getSonnetsList();
        const currentSonnet = this.model.getCurrentSonnet();

        if (currentSonnet) {
            this.view.populateSelectOptions(sonnetsList, currentSonnet.id);
            this.view.renderSonnet(currentSonnet);
        }

        this.view.bindSelectChange((selectedId) => this.handleSonnetChange(selectedId));
        this.view.bindSearchInput((query) => this.handleSearch(query));
        this.view.bindSearchResultSelect((selectedId) => this.handleSonnetChange(selectedId));
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.view.hideSearchResults();
            return;
        }
        const results = this.model.searchSonnets(query);
        this.view.renderSearchResults(results);
    }

    async handleSonnetChange(id) {
        const updatedSonnet = await this.model.loadSonnetById(id);
        if (updatedSonnet) {
            this.view.updateSelectValue(id);
            this.view.renderSonnet(updatedSonnet);
        }
    }
}