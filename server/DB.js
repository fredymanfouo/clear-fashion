const { MongoClient } = require('mongodb');
const fs = require('fs');

module.exports = {
    fetchProducts,
    fetchProductsByUuid,
    getBrands
}

const MONGODB_URI = 'mongodb+srv://fredyjr:pjRlspq60Qn2sspR@cluster0.5s85q7w.mongodb.net?retryWrites=true&w=majority';
const MONGODB_DB_NAME = 'clearfashion';
const PRODUCTS_COLLECTION_NAME = 'products';

async function connectToDatabase() {
  const client = await MongoClient.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  return client.db(MONGODB_DB_NAME);
}

async function createCollection(db) {
  const collection = await db.createCollection(PRODUCTS_COLLECTION_NAME);
  console.log(`Collection "${PRODUCTS_COLLECTION_NAME}" created.`);
  return collection;
}

async function insertProducts(collection) {
  const products = JSON.parse(fs.readFileSync('products.json'));

  await collection.deleteMany({});
  const result = await collection.insertMany(products);
  console.log(`${result.insertedCount} products inserted.`);
}

async function fetchProducts(brand = null, lessThan = null, sortedByPrice = false, sortedByDate = false, scrapedLessThanTwoWeeksAgo = false){
    const db = await connectToDatabase();
    const collection = db.collection(PRODUCTS_COLLECTION_NAME);
    console.log('Fetching products from MongoDB ...');
    var result = "none";
    var query = {};
    if (lessThan != null) query.price = {$lt: lessThan};
    if (brand != null) query.brand = brand;

    result = await collection.find(query);
    /*
    if (sortedByPrice) result = result.sort({price: 1});
    if (sortedByDate) result = result.sort({scrapDate: -1});
    */
    result = await result.toArray();
    /*
    if (scrapedLessThanTwoWeeksAgo) result = result.filter(product => new Date(product.scrapDate) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000));
    */
    return result;
}

async function fetchProductsByUuid(uuid){
    const db = await connectToDatabase();
    const collection = db.collection(PRODUCTS_COLLECTION_NAME);
    console.log('Fetching products from MongoDB ...');
    var result = "none";
    result = await collection.find({_id: uuid}).toArray();
    return result;
}

async function getBrands(){
    const db = await connectToDatabase();
    const collection = db.collection(PRODUCTS_COLLECTION_NAME);
    console.log('Fetching brands from MongoDB ...');
    var result = "none";
    result = await collection.distinct("brand");
    return result;
}

async function main() {
    const db = await connectToDatabase();
    //await createCollection(db);
    const collection = db.collection(PRODUCTS_COLLECTION_NAME);
    await insertProducts(collection);
    console.log('Done.');
    process.exit(0);
  }

/*main().catch(error => {
  console.error(error);
  process.exit(1);
});*/
