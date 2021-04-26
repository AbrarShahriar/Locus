# Enhanced localStorage with mongoose-like syntax

Locus is a localStorage API made for total begginers, to get them familiar with the whole NoSQL, Mongodb, mongoose environmental. 

Locus has mongoose-like syntax and the best part is you get to choose whether you want to use `Promise` or not (on development)

# Installation

On development...

# Usage


```javascript
//CREATE DB
Locus.createDB("db-name")
```


```javascript
//CONNECT TO DB
Locus.connect("db-name", () => {
  console.log("db connected");
})
```


```javascript
//1.GET SCHEMA INTERFACE
//2.USE IT TO CREATE A SCHEMA
const Schema = Locus.Schema

const personSchema = new Schema({
  name: String,
  age: Number,
  isAlive: Boolean
})
```


```javascript
//CREATE THE MODEL
const Person = Locus.model("Person", personSchema)
```


```javascript
//DUMMY DATA TO INSERT
const personOne = new Person({
  name: "Michael",
  age: 17,
  isAlive: true
})
```


```javascript
//SAVE IT IN COLLECTION!!
personOne.save()
```


```javascript
//READ THE WHOLE COLLECTION
const persons = Person.find()
console.log(persons);
```


```javascript
//QUERY
//FIND BY ONE FIELD
Person.find({ _id: "id_102463da8jd" })
```


```javascript
//FIND BY CONDITION eg. GREATER THAN, SMALLER THAN etc.
Person.find({ age: { $gt: 15 } })
```


```javascript
//DELETE ONE DOCUMENT
Person.deleteById({ _id: "id_c101h1097eaj" })
```


```javascript
//UPDATE ONE DOCUMENT
Person.updateById({ _id: "id_102463da8jd" }, { name: "Lucifer" })
```
