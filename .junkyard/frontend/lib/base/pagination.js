class PaginationStrategy { /*//DOC
    PaginationStrategy keeps books on the current page, total number of items, pageSize, etc.
    Based on that it the modifies the HTTP GET etc. request that is done on the DataSource.
    An instance of PaginationStrategy is owned by the DataSource.

    Say, a (subclassed) HTTPDataSource gets reply from server = { pagination: {}, data: [] }
    It then takes the pagination info and calls PaginationStrategy.set(paginationInfo)
    with correctly formatted paginationInfo
    MockDataSources just set the paginationInfo directly.

    PaginationStrategy default values default to the first page

    DataSourceWidget.read_slot()
        (Mock)DataSource.read(): 
            set paginationStrategy.totalItems
            uses paginationStrategy.currentPage, pageSize
        (HTTP)DataSource.read():
            make http call using paginationStrategy.currentPage, pageSize
            does whatever organization of the http results
            set paginationStrategy.totalItems
            uses paginationStrategy.currentPage, pageSize
        calls DataSource.paginationStrategy.getPaginationInfo()
        emit signals.pagination_changed with the paginationInfo
        emit signals.data

    Upstream widget calls DataSourceWidget.set_page_slot(pageInfo)
        pageInfo = { currentPage: int, pageSize: int}
        calls DataSource.setPage(pageInfo)
            calls paginationStrategy.set(pageInfo)
                updates members
        calls this.read_slot()
            calls DataSource.read() : uses
    */
    constructor() {
        this.baseIndex = 0;
        this.currentPage = 0;
        this.pageSize = 10;
        this.totalItems = 0;
        this.enabled = true;
    }

    setBaseIndex(i) {
        this.baseIndex = i;
        return this;
    }
    
    setPageSize(i) {
        this.pageSize = i;
        return this;
    }

    set(paginationInfo) { /*//DOC
        from DataSource

        paginationInfo = {
            currentPage: int, // can originate from upstream widgets
            pageSize: int, // can originate from upstream widgets
            totalItems: int, // set solely by DataSource
        }

        paginationInfo == null disabled pagination
        */
        if (!paginationInfo) {
            this.enabled = false; // Flag to not modify requests
            return;
        }
        this.enabled=true;
        if (paginationInfo.baseIndex !== undefined) this.baseIndex = paginationInfo.baseIndex;
        if (paginationInfo.currentPage !== undefined) this.currentPage = paginationInfo.currentPage;
        if (paginationInfo.pageSize !== undefined) this.pageSize = paginationInfo.pageSize;
        if (paginationInfo.totalItems !== undefined) this.totalItems = paginationInfo.totalItems;
    }
    
    modifyRequest(requestConfig) {
        this.err("you must subclass parseResponse");
        // Base implementation - subclasses should override
        if (!this.enabled) {
           return requestConfig; // Don't modify if disabled
        }
        // modify..
        return requestConfig;
    }
    
    parseResponse(response) {
        // Base implementation - subclasses should override
        this.err("you must subclass parseResponse");
        return response;
    }
    
    getPaginationInfo() {/*//DOC
        Returns all the base information plus the number of total pages that is calculated here
        -> usefull for downstream widgets
        */
        return {
            baseIndex: this.baseIndex,
            currentPage: this.currentPage,
            totalPages: Math.ceil(this.totalItems / this.pageSize),
            pageSize: this.pageSize,
            totalItems: this.totalItems
        };
    }
}

// Simple query parameter pagination strategy
class QueryParamPagination extends PaginationStrategy {
    modifyRequest(requestConfig) {
        if (!this.enabled) {
            return requestConfig; // Don't modify if disabled
        }
        const url = new URL(requestConfig.url);
        url.searchParams.set('page', this.currentPage);
        url.searchParams.set('pageSize', this.pageSize);
        
        return {
            ...requestConfig,
            url: url.toString()
        };
    }
    
    parseResponse(response) {
        // Assume response has { data: [], totalItems: 100 }
        if (response.totalItems !== undefined) {
            this.totalItems = response.totalItems;
        }
        return response.data || response.items || response;
    }
}

export { PaginationStrategy, QueryParamPagination}
