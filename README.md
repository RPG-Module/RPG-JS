# RPG-Module

Create your own customizable RPG game

## Add Item
In object.json
```hjson

{
  //Add to heal or loot object
      "name": "Heal potion",
      "stats": {
        //Your stats for no stats provide null
        "heal":20, //property heal give 20 point
        "lost" :20, //property lost lose 20 point
        "atk": 2, // property atk this item has 2 pint attack
        "def": 1, // property def this item has 1 pint defence
        "spd": 2 // property spd this item has 2 pint speed
      },
      "store": {
        "sell": 5, // price of sell
        "buy": 15 // price of buy
      },
      "description": "Give 20 HP." // simple description
    }
}
```

To get a new item

```js
const RPG = require('./path/to/RPG.js')

const rpg = new RPG()
const type = "heal" // heal or loot
const itemname = "Heal potion"
rpg.getItemInfo("heal","Heal potion").then(item =>{
    console.log(item)
})
```


## Add Monster
In monster.json
 ```hjson
{
"level": {
    "low": { // for low user level
          "Slime": { //Monster name
            "stats": { //monster statistics
              "atk": 2, //attack
              "def": 1, // defence
              "spd": 2 //speed
            }
          }
    },
    "medium": {// for medium user level
      
    },
    "hard": {// for hard user level
          
    },
    "legendary": {// for legendary user level
          
    }
  }
}
```

To loottable.json

```hjson
{
  "Slime" : [ //monster name
    {
      "name": "Drop of slime", //Item name (in object.json in loot section) follow Add Item section
      "proba": 0.7 //loot chance/1
    },
  ]

}
```

To get a new monster 

```js
const RPG = require('./path/to/RPG.js')

const rpg = new RPG()
const monster = "Slime" // monster name
const level = "low"
rpg.monsters.getMonsterInfo(monster, level).then(r =>{
    console.log(r)
}).catch((err)=>{
    console.log(err)
})
```
