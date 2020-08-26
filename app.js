// esversion jshit: 6

const express=require("express");
const bodyParser=require("body-parser");
//const date=require(__dirname+"/getDate");
const mongoose=require("mongoose");
const _=require("lodash");

const app=express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));  // for post method to grab anything from html
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Basant:Test123@cluster0-swbrf.mongodb.net/toDoListDB");

//var items=["Food","Meditation","Nachos","Hair"];
//let workItems=[];

const toDoListSchema={
  name: String
}



const Item=mongoose.model("Item",toDoListSchema);

const ListSchema={
  name: String,
  items: [toDoListSchema]
}

const List=mongoose.model("List",ListSchema);

const Item3= new Item({
  name: "Welcome to your to-do-list"
});
const Item1=new Item({
  name:"Hit the + button to add new item"
});
const Item2=new Item({
  name: "Check the checkbox to delete a particular item"
});

var arr=[Item1,Item2,Item3];



// to get input from HTML pages
app.get("/",function(req,res){

  //let day=date.getDate();

  /*if( date===0 || date===2){
    res.write("Yay to day is the weekend!!!");  // write to send many lines of html
    res.send(); // to send a single line or final statement.

  */

  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(arr,function(er){
        if(er){
          console.log(er);
        }else{
          console.log("Successfully inserted");
        }
      });
      res.redirect("/");
    }
    else res.render("list",{listTitle: "Today",NewListItem: foundItems});  // It means wherever it will se pair.first element in html page it wil replace it with pair.second
  });


});


// To post the results upon the input
app.post("/",function(req,res){
  //console.log(req.body);
  const recentItem=req.body.newItem;
  const listName= req.body.list;
  console.log("list name is: "+listName);
  const item= new Item({
    name: recentItem
  });

  if(listName==="Today"){

    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      if(err) console.log(err);
      else{
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
    }
  });
  }

  //res.render("list",{item:newItem})

});

app.get("/:type",function(req,res){
  const listType=_.capitalize(req.params.type);

  List.findOne({name: listType},function(err,foundList){
    if(!err){
      if(!foundList){
        // Create a new list
        const list=new List({
          name: listType,
          items: arr
        });
        list.save();
        res.redirect("/"+listType);
      }
      else {
        // Show an existing list
        res.render("list",{listTitle: listType,NewListItem: foundList.items});
      }
    }
  });

});
/*
app.post("/work",function(req,res){
  let item=req.body.newItem;

  workItems.push(item);
  res.redirect("/work");
});
*/

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName= req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err) console.log(err);
      else console.log("Successfully deleted");
      res.redirect("/");
    });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(err) console.log(err);
      else{
        res.redirect("/"+listName);
      }
    });
  }


});

app.get("/about",function(req,res){
  res.render("about");
});


let port = process.env.PORT;
if(port== null || port==""){
  port=3000;
}

app.listen(port,function(){
  console.log("Server has started successfully");
});
