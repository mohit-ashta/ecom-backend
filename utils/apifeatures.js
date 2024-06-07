class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }
  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};
    console.log(keyword);
    this.query = this.query.find({ ...keyword });
    return this;
  }
  // search(keyword) {
  //   const keywords = keyword
  //      ? {
  //          $or: [
  //            { name: { $regex: keyword, $options: "i" } },
  //            { email: { $regex: keyword, $options: "i" } },
  //            { location: { $regex: keyword, $options: "i" } },
  //          ],
  //        }
  //      : {};
   
  //   this.query = this.query.find({ ...keywords });
  //   return this;
  //  }
  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort({ createdAt: -1 }); // Default sorting by createdAt in descending order
    }
    return this;
  }


  filter() {
    const queryCopy = { ...this.queryStr };
    // Remove some fields
    const removeFields = ["keyword", "page", "limit"];
    removeFields.forEach((key) => delete queryCopy[key]);

    // filter for price and rating
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);
    console.log(queryStr);
    // Apply the filter to the query
    this.query = this.query.find(JSON.parse(queryStr));
    console.log(queryStr);
    return this;
  }
  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resultPerPage * (currentPage - 1);
    this.query = this.query.limit(resultPerPage).skip(skip);
    return this;
  }
}

module.exports = ApiFeatures;
