export default class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        //1)- delete all the words we don't need in filter
        const queryObject = { ...this.queryString };
        const execlude = ["page", "sort", "limit", "fields"];
        execlude.forEach((key) => delete queryObject[key]);
        //------------------------------------------------------

        //2)-replace all the operators with $operator
        let queryStr = JSON.stringify(queryObject);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        //-------------------------------------------------------------------------
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        // Sorting... query.sort() -> takes the arguments with spcae between them
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.replaceAll(",", " ");
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort("-price");
        }
        return this;
    }
    limitFields() {
        // limit fields -> select specific fields from the documents
        // Projecttion
        if (this.queryString.fields) {
            const limitBy = this.queryString.fields.replaceAll(",", " ");
            this.query = this.query.select(limitBy);
        } else {
            this.query = this.query.select("-__v");
        }
        return this;
    }
    paginate() {
        // Pagination -> page -1 * limit
        if (this.queryString.page || this.queryString.limit) {
            const page = Number(this.queryString.page) || 1;
            const limit = Number(this.queryString.limit) || 100;
            const skip = (page - 1) * limit;
            this.query = this.query.skip(skip).limit(limit);
        }
        return this;
    }
}

