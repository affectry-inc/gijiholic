'use strict';

//via http://qiita.com/itagakishintaro/items/a1519998a91061cbfb1e

var db;
var MongoClient = require('mongodb').MongoClient
var assert = require('assert');

var url = process.env.MONGODB_URI || 'mongodb://localhost:27017';

MongoClient.connect(url, function(err, mongodb) {
  assert.equal(null, err);
  console.log("Connected correctly to server");
  db = mongodb;
});

/** 
 * @param collection_name コレクション名
 * @param {json} criteria 検索条件
 * @param {json} projection 項目指定
 * @param callback コールバック関数
 * http://docs.mongodb.org/manual/reference/method/db.collection.find/
 */
function find(collection_name, criteria, projection, sortation, callback){
  db.collection(collection_name, function(outer_error, collection){
    // collection.find(criteria, projection).toArray(function(inner_error, list){
    collection.find(criteria, projection).sort(sortation).toArray(function(inner_error, list){
      callback(list);
    });
  });
}

/** 
 * @param collection_name コレクション名
 * @param {json} document 挿入ドキュメント
 * @param callback コールバック関数
 * http://docs.mongodb.org/manual/reference/method/db.collection.insert/
 */
function insert(collection_name, document, options, callback){
  db.collection(collection_name, function(outer_error, collection){
    collection.insert(document, options, function(inner_error, result){
      callback(result);
    });
  });
}

/** 
 * @param collection_name コレクション名
 * @param {json} query 更新条件
 * @param {json} update 更新内容
 * @param {json} options オプション
 * @param callback コールバック関数
 * http://docs.mongodb.org/manual/reference/method/db.collection.update/
 */
function update(collection_name, query, update, options, callback){
  db.collection(collection_name, function(outer_error, collection){
    collection.update(query, update, options, function(inner_error, result){
      callback(result);
    });
  });
}

/** 
 * @param collection_name コレクション名
 * @param {json} query 削除条件
 * @param {boolean} justOne 
 * @param callback コールバック関数
 * http://docs.mongodb.org/manual/reference/method/db.collection.remove/
 */
function remove(collection_name, query, options, callback){
  db.collection(collection_name, function(outer_error, collection){
    collection.remove(query, options, function(inner_error, result){
      callback(result);
    });
  });
}

module.exports = {
  find: find,
  insert: insert,
  update: update,
  remove: remove
}
