// const log = console.log

const Locus = (function () {
  return this
})();

//init values
Locus._db = {}
Locus._templates = {}
Locus._db.collections = {}
Locus._dbName = ''
Locus._queryKeywords = {
  $gt: (docs, key, val) => Locus.$gt(docs, key, val),
  $gte: (docs, key, val) => Locus.$gte(docs, key, val),
  $st: (docs, key, val) => Locus.$st(docs, key, val),
  $ste: (docs, key, val) => Locus.$ste(docs, key, val)
}


//********set - get*********//

//create
Locus.set = function(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
  return this
}
  
//read
Locus.get = function(key) {
  return JSON.parse(localStorage.getItem(key))
}

//********MongoDB*********//

// query helper
Locus.$gt = function(docs, key, val) {
  return docs.filter(doc => doc[key] > val)
}

Locus.$gte = function(docs, key, val) {
  return docs.filter(doc => doc[key] >= val)
}

Locus.$st = function(docs, key, val) {
  return docs.filter(doc => doc[key] < val)
}

Locus.$ste = function(docs, key, val) {
  return docs.filter(doc => doc[key] <= val)
}

//model
Locus.model = function(colName, template) {
  let formattedColName = colName.toLowerCase() + "s"

  Locus._templates[formattedColName] = template
  let collectionObj = {}
  
  if(!Locus.get(Locus._dbName).collections[formattedColName]) {
    Object.assign(Locus._db.collections, { [formattedColName]: {} })
    Locus._update()
  }
  
  const mappedObjToTemplate = function(obj) {
    return Locus._mapObjToTemplate(Locus._templates[formattedColName]["_template"], obj, colName)
  }
  
  //find
  mappedObjToTemplate._colName_ = colName 
  mappedObjToTemplate.find = Locus._find
  
  return mappedObjToTemplate
}

//query function

//find
Locus._find = function(filter = {}) {

  const docs = Locus.collection(this._colName_)

  const keysToSearchBy = Object.keys(filter)
  
  if(Locus._valueTypeCheck(filter[keysToSearchBy[0]]) == "Object") {
    let queryHelper = Object.keys(filter[keysToSearchBy[0]])
    if(Locus._queryKeywords.hasOwnProperty(queryHelper[0])) {
      return Locus._queryKeywords[queryHelper[0]](docs, keysToSearchBy[0], filter[keysToSearchBy[0]][queryHelper[0]])
    } else {
      return log("Invalid key: ", keysToSearchBy[0])
    }
  }

  const filteredDocs = docs.filter(doc => doc[keysToSearchBy[0]] == filter[keysToSearchBy[0]])

  return filteredDocs
}

//get collection
Locus.collection = function(modelName) {
  const arr = []
  let formattedColName = modelName.toLowerCase() + "s"
  
  const collection = {...Locus.get(Locus._dbName).collections[formattedColName]}

  for(var key in collection) {
    arr.push(collection[key])
  }
  
  return arr
}

//map passed obj to template
Locus._mapObjToTemplate = function(template, obj, colName) {
  let mappedObj = {}
  for(var key in obj) {
    if(template.hasOwnProperty(key)) {
      if(Locus._valueTypeCheck(obj[key]) == template [key]) {
        mappedObj[key] = obj[key]
      } else {
        log(key, " doesn't match", template[key])
      }
    } else {
      log(key, " not defined in Schema for ", colName)
    }
  }
  
  return Object.assign(mappedObj, { _name_: colName ,save: function() { Locus.saveDoc(mappedObj._name_, this) }})
}

//save document 
Locus.saveDoc = function(colName, ref) {
  Locus._db = Locus.get(Locus._dbName)

  var formattedColName = colName.toLowerCase() + "s";

  var refObj = {...ref}
  
  delete refObj._name_
  delete refObj.save
  
  refObj._id = Locus.randomId(formattedColName)
  
  const updatedCol = {
    ...Locus._db.collections[formattedColName],
    [refObj._id]: refObj
  }
  
  Locus._db.collections[formattedColName] = updatedCol
 
  Locus._update()
}

//temlate/schema
Locus.Schema = function(template) {
  this._template = Locus._assignType(template) 
}

//********Type*********//


//type checker for Schema
Locus._typeCheck = function(value) {
  let type = undefined
  if(typeof value === "function" || "Function") {
    type = Object.prototype.toString.call(value()).slice(8, -1)
  } else {
    type = Object.prototype.toString.call(value).split(" ")
  }
  return type
}

//check passed value type

Locus._valueTypeCheck = function (value) {
  return Object.prototype.toString.call(value).slice(8,-1)
}

//type object

Locus._type = function(value) {
  this._type_ = Locus._typeCheck(value)
  let state = undefined
  this._set = function(newValue) {
    if(this._type_ != Locus._typeCheck(newValue)) {
      log("dont match type")
    } else {
      state = newValue
    }
  }
  
  return this._type_
}

//type assign
Locus._assignType = function(template) {
  for(var key in template) {
    template[key] = Locus._type(template[key]) 
  }
  return template
}


//********DB*********//


//create db only run once 
Locus.createDB = function(dbName = Locus.randomName(), mode = "static") {
  
  if(!Locus.get(dbName)) {
    Locus.set(dbName, { _name: dbName, _mode: mode, collections: {} })
  }
}

//connect to the db
Locus.connect = function(dbName, callback) {
  
  if(typeof callback != "function") {
    return console.error("Please, pass a callback function to connect")
  }
  if(localStorage.getItem(dbName)) {
    Locus._dbName = dbName
    Locus._db = Locus.get(dbName)
    Locus._db.collections = {}

    callback()
  } else {
    console.error("No such DB found: ", dbName)
  }
}

//delete all db
Locus.reset = function() {
  localStorage.clear()
}

//delete one db
Locus.delete = function(dbName) {
  if(!dbName || !localStorage.getItem(dbName)) {
    console.log("No such DB", dbName)
  } else if(localStorage.getItem(dbName)) {
    localStorage.removeItem(dbName)
  } else {
    console.error("Something went wrong")
  }
}

//update db
Locus._update = function() {
  Locus.set(Locus._db._name, Locus._db)
  Locus._db = Locus.get(Locus._db._name)
}

//********utils*********//


//random db name 
Locus.randomName = function() {
  const arr = ["a", "b", "c", "d", "e", 1, 2, 3, 4, 5]
  let output = ""

  for (let i = 0; i < 5; i++) {
    output += arr[Math.floor(Math.random() * arr.length)]
  }
  return "db_" + output
}

//randomId 
Locus.randomId = function() {
  const arr = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  let output = ""

  for (let i = 0; i < 10; i++) {
    output += arr[Math.floor(Math.random() * arr.length)]
  }
  
  return "id_" + output
}
