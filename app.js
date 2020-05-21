const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const date= require(__dirname+ '/date.js');
const mongoose = require('mongoose');
const _ = require("lodash");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set("view engine", "ejs");

//console.log(date);
mongoose.connect("mongodb+srv://admin-tejesh:Test123@cluster0-zqzsc.mongodb.net/todolistDB",{useNewUrlParser:true});
const itemSchema = new mongoose.Schema({
    name: String
});
const Item = mongoose.model("Item",itemSchema);
const item1 = new Item({
  name: "Welcome to your to-do list!"
});
const item2 = new Item({
  name: "Hit the + to add!"
});
const item3 = new Item({
  name: "Check the item to delete!"
});
const defaultArray = [item1,item2,item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});
const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find(function(err,foundItems){
    if(err)console.log(err);
    else{
      if(foundItems.length===0){
        Item.insertMany(defaultArray,function(err){
          if(err)console.log(err);
          else console.log("Successfully saved default items");
        });
        res.redirect('/');
      }
      res.render("list", {
        listTitle: date.getDay(),
        newListItems: foundItems
      });
    }
  })
})
app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName},function(err,foundList){
    if(err)console.log(err);
    else{
      if(!foundList){
        const list = new List({
          name : customListName,
          items: defaultArray
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list",{
          listTitle: foundList.name,
          newListItems: foundList.items
        })
      }
    }
  })
})
app.post("/", function(req,res){
  const itemName = req.body.newItem;
  const listName =req.body.list;
  const item = new Item({
    name: itemName
  })
  if(listName===date.getDay()){
    item.save();
    res.redirect('/');
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

})

app.post("/delete",function(req,res){
  const checkedItem=req.body.checkbox;
  const checkedList=req.body.listName;
  console.log(checkedList);
  if(checkedList===date.getDate()){
    Item.deleteOne({_id:checkedItem},function(err){
      if(err)console.log(err);
      else res.redirect('/');
    })
  }
  else{
    List.findOneAndUpdate({name:checkedList}, {$pull: {items:{_id:checkedItem}}},function(err,foundList){
      if(err)console.log(err);
      else res.redirect("/"+checkedList);
    })
  }
})
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server running.");
})
