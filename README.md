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


```
//CONNECT TO DB
Locus.connect("db-name", () => {
  console.log("db connected");
})
```


```
//1.GET SCHEMA 
//2.USE IT TO CREATE A SCHEMA
const Schema = Locus.Schema

const personSchema = new Schema({
  name: String,
  age: Number,
  isAlive: Boolean
})
```


```
//CREATE THE MODEL
const Person = Locus.model("Person", personSchema)
```


```
//DUMMY DATA TO INSERT
const personOne = new Person({
  name: "anto",
  age: 17,
  isAlive: true
})
```


```
//SAVE IT IN COLLECTION!!
personOne.save()
```


```
//SEE THE RESULT!!
const persons = Locus.collection("Person")
console.log(persons);
```








