const log = console.log

const LocalDB = (function () {
  
  const db = function() {
    
  }
  
  //create
  db.prototype.set = function(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
    return this
  }
  
  //read
  db.prototype.get = function(key) {
    return JSON.parse(localStorage.getItem(key))
  }
  
  return new db()
})();

//init values
LocalDB._db = {}
LocalDB._templates = {}
LocalDB._db.collections = {}
LocalDB._dbName = ''

//********MongoDB*********//


//model
LocalDB.model = function(colName, template) {
  let formattedColName = colName.toLowerCase() + "s"

// log(LocalDB.get(LocalDB._dbName))

  LocalDB._templates[formattedColName] = template
  let collectionObj = {}
  
  if(!LocalDB.get(LocalDB._dbName).collections[formattedColName]) {
    Object.assign(LocalDB._db.collections, { [formattedColName]: {} })
    LocalDB._update()
  }
  
  return function(obj) {
    return LocalDB._mapObjToTemplate(LocalDB._templates[colName.toLowerCase() + "s"]["_template"], obj, colName)
  }
}

//get collection
LocalDB.collection = function(modelName) {
  const arr = []
  let formattedColName = modelName.toLowerCase() + "s"
  
  const collection = {...LocalDB.get(LocalDB._dbName).collections[formattedColName]}

  for(var key in collection) {
    arr.push(collection[key])
  }
  
  return arr
}

//map passed obj to template
LocalDB._mapObjToTemplate = function(template, obj, colName) {
  let mappedObj = {}
  for(var key in template) {
    if(obj.hasOwnProperty(key)) {
      if(LocalDB._valueTypeCheck(obj[key]) == template [key]) {
        mappedObj[key] = obj[key]
      } else {
        log(key, " doesn't match", template[key])
      }
    } else {
      log(key, " not in template")
    }
  }
  
  return Object.assign(mappedObj, { _name_: colName ,save: function() { LocalDB.saveDoc(mappedObj._name_, this) }})
}

//save document 
LocalDB.saveDoc = function(colName, ref) {
  LocalDB._db = LocalDB.get(LocalDB._dbName)

  var formattedColName = colName.toLowerCase() + "s";

  var refObj = {...ref}
  
  delete refObj._name_
  delete refObj.save
  
  refObj._id = LocalDB.randomId(formattedColName)
  
  const updatedCol = {
    ...LocalDB._db.collections[formattedColName],
    [refObj._id]: refObj
  }
  
  LocalDB._db.collections[formattedColName] = updatedCol
 
  LocalDB._update()
}

//temlate/schema
LocalDB.Schema = function(template) {
  this._template = LocalDB._assignType(template) 
}

//********Type*********//


//type checker for Schema
LocalDB._typeCheck = function(value) {
  let type = undefined
  if(typeof value === "function" || "Function") {
    type = Object.prototype.toString.call(value()).slice(8, -1)
  } else {
    type = Object.prototype.toString.call(value).split(" ")
  }
  return type
}

//check passed value type

LocalDB._valueTypeCheck = function (value) {
  return Object.prototype.toString.call(value).slice(8,-1)
}

//type object

LocalDB._type = function(value) {
  this._type_ = LocalDB._typeCheck(value)
  let state = undefined
  this._set = function(newValue) {
    if(this._type_ != LocalDB._typeCheck(newValue)) {
      log("dont match type")
    } else {
      state = newValue
    }
  }
  
  return this._type_
}

//type assign
LocalDB._assignType = function(template) {
  for(var key in template) {
    template[key] = LocalDB._type(template[key]) 
  }
  return template
}


//********DB*********//


//create db only run once 
LocalDB.createDB = function(dbName = LocalDB.randomName(), mode = "static") {
  
  if(!LocalDB.get(dbName)) {
    LocalDB.set(dbName, { _name: dbName, _mode: mode, collections: {} })
  }
}

//connect to the db
LocalDB.connect = function(dbName, callback) {
  
  if(typeof callback != "function") {
    return console.error("Please, pass a callback function to connect")
  }
  if(localStorage.getItem(dbName)) {
    LocalDB._dbName = dbName
    LocalDB._db = LocalDB.get(dbName)
    LocalDB._db.collections = {}

    callback()
  } else {
    console.error("No such DB found: ", dbName)
  }
}

//delete all db
LocalDB.reset = function() {
  localStorage.clear()
}

//delete one db
LocalDB.delete = function(dbName) {
  if(!dbName || !localStorage.getItem(dbName)) {
    console.log("No such DB", dbName)
  } else if(localStorage.getItem(dbName)) {
    localStorage.removeItem(dbName)
  } else {
    console.error("Something went wrong")
  }
}

//update db
LocalDB._update = function() {
  LocalDB.set(LocalDB._db._name, LocalDB._db)
  LocalDB._db = LocalDB.get(LocalDB._db._name)
}

//********utils*********//


//random db name 
LocalDB.randomName = function() {
  const arr = ["a", "b", "c", "d", "e", 1, 2, 3, 4, 5]
  let output = ""

  for (let i = 0; i < 5; i++) {
    output += arr[Math.floor(Math.random() * arr.length)]
  }
  return "db_" + output
}

//randomId 
LocalDB.randomId = function() {
  const arr = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  let output = ""

  for (let i = 0; i < 10; i++) {
    output += arr[Math.floor(Math.random() * arr.length)]
  }
  
  return "id_" + output
}
